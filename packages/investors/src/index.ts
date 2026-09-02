/**
 * packages/investors : profil investisseur, tolérance au risque, auto-invest,
 * et vérification manuelle (§ demande produit : crédibilité vis-à-vis des
 * emprunteurs). Même principe que packages/kyc : l'investisseur dépose deux
 * justificatifs (source de revenus, disponibilité des fonds), un agent les
 * examine "à la main" depuis le back-office et confirme ou rejette. Aucun
 * prestataire tiers pour l'instant, seulement les événements qui font
 * avancer le statut (règle §02 de communication inter-modules).
 */
import { usersRepo, documentsRepo, fundingRepo } from "@fintech/database";
import { emit } from "@fintech/workflow";

export function setRiskProfile(userId: string, riskTolerance: "low" | "moderate" | "high") {
  return usersRepo.upsertInvestorProfile(userId, { riskTolerance });
}

export function getPortfolio(investorId: string) {
  return fundingRepo.getPortfolio(investorId);
}

/** L'investisseur a déposé ses deux justificatifs, passe en attente d'un agent. */
export async function submitForVerification(userId: string, documentIds: string[]) {
  await usersRepo.setInvestorVerificationStatus(userId, "PENDING_REVIEW", { rejectionReason: null });
  await emit("investor.verification_submitted", { userId, documentIds });
}

/** Un agent confirme la vérification depuis le back-office. */
export async function confirmVerification(userId: string, documentIds: string[], agentId: string) {
  await Promise.all(documentIds.map((id) => documentsRepo.setStatus(id, "VERIFIED")));
  await usersRepo.setInvestorVerificationStatus(userId, "VERIFIED", { verifiedAt: new Date(), rejectionReason: null });
  await emit("investor.verified", { userId, agentId });
}

/** Un agent rejette la vérification (justificatif illisible, montant non crédible, etc.). */
export async function rejectVerification(userId: string, documentIds: string[], agentId: string, reason: string) {
  await Promise.all(documentIds.map((id) => documentsRepo.setStatus(id, "REJECTED")));
  await usersRepo.setInvestorVerificationStatus(userId, "REJECTED", { rejectionReason: reason });
  await emit("investor.rejected", { userId, agentId, reason });
}

export function listPendingVerifications() {
  return usersRepo.listPendingInvestorVerifications();
}

export function listOwnDocuments(userId: string) {
  return documentsRepo.listForOwner(userId);
}
