/**
 * packages/kyc : vérification d'identité MANUELLE.
 *
 * Décision produit (pas de fournisseur KYC automatisé pour l'instant) :
 * le client dépose ses documents, un agent le contacte et vérifie "à la main"
 * depuis le back-office, puis confirme ou rejette. Ce module ne connaît donc
 * aucun prestataire tiers, seulement les événements qui font avancer une
 * demande de KYC_PENDING à KYC_VERIFIED (règle §02 de communication).
 *
 * Pour automatiser plus tard (fournisseur externe type Onfido/Veriff) :
 * remplacer le contenu de `requestManualReview` par l'appel au prestataire,
 * sans changer la signature des fonctions ni les événements émis, le reste
 * de la plateforme n'a rien à savoir du changement.
 */
import { documentsRepo, applicationsRepo } from "@fintech/database";
import { emit, registerHandler } from "@fintech/workflow";

/**
 * Appelé automatiquement quand une demande passe en SUBMITTED (§9, §50).
 * Prévient l'équipe support qu'un dossier attend un contact manuel, voir
 * packages/notifications, qui transforme cet événement en ticket de support.
 */
export async function requestManualReview(userId: string, applicationId: string, documentIds: string[]) {
  await applicationsRepo.transitionStatus(applicationId, "KYC_PENDING");
  await emit("kyc.manual_review_requested", { userId, applicationId, documentIds });
}

/** Un agent confirme la vérification depuis le back-office. */
export async function confirmVerification(
  userId: string,
  documentIds: string[],
  agentId: string,
  applicationId: string
) {
  await Promise.all(documentIds.map((id) => documentsRepo.setStatus(id, "VERIFIED")));
  await emit("kyc.completed", { userId, agentId, applicationId });
}

/** Un agent rejette la vérification (pièce illisible, expirée, etc.). */
export async function rejectVerification(
  userId: string,
  documentIds: string[],
  agentId: string,
  reason: string,
  applicationId: string
) {
  await Promise.all(documentIds.map((id) => documentsRepo.setStatus(id, "REJECTED")));
  await emit("kyc.rejected", { userId, agentId, reason, applicationId });
}

registerHandler("application.status_changed", async (payload) => {
  const { applicationId, toStatus, borrowerId, documentIds } = payload as {
    applicationId: string;
    toStatus: string;
    borrowerId?: string;
    documentIds?: string[];
  };
  if (toStatus !== "SUBMITTED" || !borrowerId) return;
  await requestManualReview(borrowerId, applicationId, documentIds ?? []);
});
