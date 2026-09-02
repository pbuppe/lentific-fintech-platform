/**
 * Point d'amorçage Next.js (exécuté une fois au démarrage du serveur).
 *
 * apps/web et apps/admin sont deux processus Node séparés : chacun a sa
 * propre copie en mémoire de @fintech/workflow. Sans cet import explicite ici
 * aussi, une action confirmée depuis le back-office (ex. confirmVerification
 * dans apps/admin/app/kyc) émettrait bien un événement, mais aucun des
 * modules qui doivent réagir en cascade (applications, loans, contracts...)
 * ne serait chargé dans CE processus pour l'écouter. Même liste que
 * apps/web/instrumentation.ts, pour que la chaîne complète fonctionne quel
 * que soit le processus qui déclenche le premier événement.
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
