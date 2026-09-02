/**
 * packages/applications : cycle de vie d'une demande de financement, transitions
 * de statut (§9, §10). Toute transition passe par workflow.emitStatusChanged
 * pour que les autres modules réagissent sans être appelés directement (règle §02).
 */
import {
  applicationsRepo,
  offersRepo,
  usersRepo,
  contractsRepo,
  signaturesRepo,
  type ApplicationStatus,
} from "@fintech/database";
import { assessRisk } from "@fintech/risk";
import { emit, registerHandler } from "@fintech/workflow";

function generateReference(): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 900000 + 100000);
  return `APP-${year}-${seq}`;
}

export async function submitApplication(input: {
  borrowerId: string;
  productId: string;
  amount: number;
  durationMonths: number;
  purpose: string;
  countryId: string;
  currencyId: string;
}) {
  const application = await applicationsRepo.create({
    reference: generateReference(),
    ...input,
  });

  const submitted = await applicationsRepo.transitionStatus(application.id, "SUBMITTED", input.borrowerId);

  // Événement consommé par packages/kyc (déclenche la vérification), §50.
  await emit("application.status_changed", {
    applicationId: submitted.id,
    toStatus: "SUBMITTED" satisfies ApplicationStatus,
    borrowerId: input.borrowerId,
  });

  return submitted;
}

export async function moveToStatus(applicationId: string, status: ApplicationStatus, actorId?: string) {
  const updated = await applicationsRepo.transitionStatus(applicationId, status, actorId);
  await emit("application.status_changed", { applicationId, toStatus: status });
  return updated;
}

export function getApplication(applicationId: string) {
  return applicationsRepo.findById(applicationId);
}

export function listBorrowerApplications(borrowerId: string) {
  return applicationsRepo.listByBorrower(borrowerId);
}

export function listQueueByStatus(status: ApplicationStatus) {
  return applicationsRepo.listByStatus(status);
}

/**
 * Un agent lance l'analyse (§14) une fois le KYC vérifié : calcule un score
 * via le moteur de risque à partir du profil emprunteur, l'enregistre sur la
 * demande, puis passe le dossier en revue humaine (§16).
 */
export async function reviewApplication(applicationId: string, actorId: string) {
  const application = await applicationsRepo.findById(applicationId);
  if (!application) throw new Error("Demande introuvable.");

  const borrower = await usersRepo.findById(application.borrowerId);
  const profile = borrower?.borrowerProfile;
  if (!profile) throw new Error("Profil financier de l'emprunteur incomplet, impossible de calculer le score.");

  const risk = assessRisk({
    income: Number(profile.income),
    expenses: Number(profile.expenses),
    existingDebt: Number(profile.existingDebt),
    requestedAmount: Number(application.amount),
    durationMonths: application.durationMonths,
  });

  await applicationsRepo.setScore(applicationId, risk.score);
  const updated = await applicationsRepo.transitionStatus(applicationId, "UNDER_REVIEW", actorId);
  await emit("application.reviewed", { applicationId, score: risk.score, grade: risk.grade, riskLevel: risk.riskLevel });
  return { application: updated, risk };
}

/** Un agent crée une offre pour une demande en revue et la publie (§17). */
export async function createOffer(
  applicationId: string,
  offer: { amount: number; durationMonths: number; rate: number },
  actorId: string
) {
  const created = await offersRepo.create({ applicationId, ...offer });
  await applicationsRepo.transitionStatus(applicationId, "PUBLISHED", actorId);
  await emit("offer.created", { applicationId, offerId: created.id });
  return created;
}

/** L'emprunteur accepte l'offre publiée, déclenche prêt, contrat, signature en cascade. */
export async function acceptOffer(offerId: string, actorId: string) {
  const offer = await offersRepo.findById(offerId);
  if (!offer) throw new Error("Offre introuvable.");

  await offersRepo.updateStatus(offerId, "ACCEPTED");
  await applicationsRepo.transitionStatus(offer.applicationId, "OFFER_ACCEPTED", actorId);

  await emit("offer.accepted", {
    offerId,
    applicationId: offer.applicationId,
    amount: Number(offer.amount),
    durationMonths: offer.durationMonths,
    rate: Number(offer.rate),
  });

  return offer;
}

export function listOffersForApplication(applicationId: string) {
  return offersRepo.listForApplication(applicationId);
}

/**
 * Vue consolidée pour l'espace emprunteur : la demande, son offre acceptée
 * (s'il y en a une), le contrat généré et la signature en attente/confirmée.
 * Regroupe ici la traversée des relations plutôt que dans les pages, pour
 * que apps/web reste un simple assemblage d'écrans (règle §05).
 */
export async function getApplicationDetail(applicationId: string) {
  const application = await applicationsRepo.findById(applicationId);
  if (!application) return null;

  const acceptedOffer = application.offers.find((o) => o.status === "ACCEPTED") ?? null;
  const loan = acceptedOffer?.loan ?? null;
  const contract = loan ? await contractsRepo.findByLoanId(loan.id) : null;
  const signature = contract ? await signaturesRepo.findByContract(contract.id) : null;

  return { application, acceptedOffer, loan, contract, signature };
}

/**
 * Balayage périodique du SLA "Dossier Prioritaire" (48h), appelé
 * automatiquement par le planificateur de instrumentation-node.ts. Émet un
 * événement de relance pour chaque dossier prioritaire encore en attente
 * dont l'échéance vient de passer, puis marque le dossier pour ne pas le
 * relancer une deuxième fois au balayage suivant.
 */
export async function checkSlaBreaches() {
  const overdue = await applicationsRepo.listOverdueSla(new Date());
  for (const application of overdue) {
    await applicationsRepo.markSlaBreached(application.id);
    await emit("application.sla_breached", {
      applicationId: application.id,
      reference: application.reference,
      borrowerId: application.borrowerId,
    });
  }
  return overdue.length;
}

// Une fois le KYC confirmé par un agent, la demande avance automatiquement.
registerHandler("kyc.completed", async (payload) => {
  const { applicationId } = payload as { applicationId: string };
  if (!applicationId) return;
  await applicationsRepo.transitionStatus(applicationId, "KYC_VERIFIED");
});

registerHandler("kyc.rejected", async (payload) => {
  const { applicationId } = payload as { applicationId: string };
  if (!applicationId) return;
  await applicationsRepo.transitionStatus(applicationId, "REJECTED");
});

// Une fois la signature du contrat confirmée par un agent, le dossier est finalisé.
registerHandler("contract.signed", async (payload) => {
  const { applicationId } = payload as { applicationId?: string };
  if (!applicationId) return;
  await applicationsRepo.transitionStatus(applicationId, "CONTRACT_SIGNED");
});
