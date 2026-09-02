/**
 * packages/workflow : orchestration événementielle inter-modules (§15, §50).
 *
 * Le cahier des charges décrit tout le parcours comme une chaîne d'événements :
 * demande soumise → document vérifié → offre acceptée → contrat signé → paiement reçu.
 * En production, ces événements sont publiés/consommés via Inngest (reprises
 * automatiques en cas d'échec). Ce fichier expose la même interface (`emit` /
 * `registerHandler`) avec un bus en mémoire, pour que le code métier des autres
 * packages n'ait RIEN à changer le jour où l'adapter Inngest réel est branché
 * (voir README "Prochaines étapes").
 *
 * Règle §02 : un changement d'état important est publié comme événement via
 * ce module, jamais appelé directement d'un package à l'autre.
 *
 * IMPORTANT (bug corrigé pendant la nuit de construction) : Next.js compile
 * chaque route séparément et peut charger plusieurs instances du même module
 * en dev. Un simple `const handlers = new Map()` au niveau du module se
 * retrouvait donc parfois vide selon la route qui appelait `emit()`, même si
 * `registerHandler()` avait bien été appelé au démarrage (instrumentation.ts
 * de chaque application). Même remède que packages/database/src/client.ts
 * pour Prisma : stocker la map sur `globalThis` pour garantir un seul et
 * même bus dans tout le process.
 */

export type WorkflowEvent =
  | "application.status_changed"
  | "application.reviewed"
  | "document.verified"
  | "kyc.manual_review_requested"
  | "kyc.completed"
  | "kyc.rejected"
  | "offer.created"
  | "offer.accepted"
  | "loan.created"
  | "contract.generated"
  | "signature.uploaded"
  | "signature.rejected"
  | "contract.signed"
  | "payment.received"
  | "investment.created"
  | "funding.opened"
  | "introduction.paid"
  | "investor.verification_submitted"
  | "investor.verified"
  | "investor.rejected"
  | "document.requested"
  | "document.request_fulfilled"
  | "subscription.started"
  | "subscription.renewed"
  | "subscription.cancelled"
  | "application.sla_breached";

type Payload = Record<string, unknown>;
type Handler = (payload: Payload) => Promise<void> | void;

const globalForWorkflow = globalThis as unknown as { workflowHandlers?: Map<WorkflowEvent, Handler[]> };

const handlers = globalForWorkflow.workflowHandlers ?? new Map<WorkflowEvent, Handler[]>();
globalForWorkflow.workflowHandlers = handlers;

export function registerHandler(event: WorkflowEvent, handler: Handler) {
  const existing = handlers.get(event) ?? [];
  existing.push(handler);
  handlers.set(event, existing);
}

export async function emit(event: WorkflowEvent, payload: Payload) {
  const registered = handlers.get(event) ?? [];
  for (const handler of registered) {
    try {
      await handler(payload);
    } catch (error) {
      // En production : log structuré + reprise automatique (Inngest).
      console.error(`[workflow] échec du handler pour "${event}"`, error);
    }
  }
}
