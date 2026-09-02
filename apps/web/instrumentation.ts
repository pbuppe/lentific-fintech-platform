/**
 * Point d'amorçage Next.js (exécuté une fois au démarrage du serveur).
 *
 * Les modules ci-dessous s'enregistrent auprès de @fintech/workflow via
 * registerHandler() au moment où ils sont importés (effet de bord). Sans cet
 * import explicite, un module comme @fintech/kyc ne serait jamais chargé,
 * et n'écouterait donc jamais "application.status_changed", puisque
 * @fintech/applications ne l'importe pas directement (règle §02 : la
 * communication passe par les événements, pas par les imports directs).
 *
 * L'import dynamique de instrumentation-node.ts est délibérément le SEUL
 * import de ce fichier (voir son commentaire) : c'est ce qui permet à
 * Next.js de ne pas essayer de compiler ces modules pour le runtime Edge.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerNodeHandlers } = await import("./instrumentation-node");
    await registerNodeHandlers();
  }
}
