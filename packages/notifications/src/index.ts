/**
 * packages/notifications : écoute les événements métier et notifie l'utilisateur
 * concerné (email/push/in-app), ou crée un ticket de support pour l'équipe
 * quand une action humaine est requise (vérification KYC manuelle, contrôle
 * d'une signature uploadée). Ne connaît jamais la logique métier elle-même,
 * seulement les événements (§02, §50).
 */
import { prisma, usersRepo } from "@fintech/database";
import { registerHandler } from "@fintech/workflow";

async function notify(userId: string, event: string, channel: "email" | "push" | "in_app" = "in_app") {
  return prisma.notification.create({ data: { userId, event, channel } });
}

async function openSupportTicket(userId: string, subject: string) {
  return prisma.supportTicket.create({ data: { userId, status: "open", subject } });
}

// --- Vérification d'identité manuelle (§ décision produit) -----------------

registerHandler("kyc.manual_review_requested", async (payload) => {
  const { userId, applicationId } = payload as { userId: string; applicationId: string };
  await openSupportTicket(userId, `Vérification d'identité à effectuer : dossier ${applicationId}`);
  await notify(userId, "kyc.manual_review_requested", "email"); // "nous allons vous contacter sous peu"
});

registerHandler("kyc.completed", async (payload) => {
  const { userId } = payload as { userId: string };
  await notify(userId, "kyc.completed", "email");
});

registerHandler("kyc.rejected", async (payload) => {
  const { userId, reason } = payload as { userId: string; reason: string };
  console.log(`[notifications] KYC rejeté pour ${userId} : ${reason}`);
  await notify(userId, "kyc.rejected", "email");
});

// --- Signature manuelle (§ décision produit) --------------------------------

registerHandler("contract.generated", async (payload) => {
  const { contractId } = payload as { contractId: string };
  console.log(`[notifications] contrat ${contractId} prêt : le client doit l'imprimer, le signer et l'uploader`);
});

registerHandler("signature.uploaded", async (payload) => {
  const { contractId, ownerId } = payload as { contractId: string; ownerId: string };
  // Un agent doit vérifier la pièce uploadée avant de confirmer la signature.
  await openSupportTicket(ownerId, `Contrat signé à vérifier : ${contractId}`);
});

registerHandler("signature.rejected", async (payload) => {
  const { signatureId, reason } = payload as { signatureId: string; reason: string };
  console.log(`[notifications] signature ${signatureId} rejetée : ${reason}`);
});

registerHandler("contract.signed", async (payload) => {
  console.log(`[notifications] contrat confirmé signé`, payload);
});

registerHandler("payment.received", async (payload) => {
  console.log(`[notifications] paiement reçu`, payload);
});

// --- Mise en relation directe payante (§ demande produit) -------------------

registerHandler("introduction.paid", async (payload) => {
  const { targetUserId } = payload as { targetUserId: string };
  await notify(targetUserId, "introduction.paid", "email"); // "quelqu'un a payé pour obtenir ton contact"
});

// --- Vérification manuelle de l'investisseur (§ demande produit) -----------

registerHandler("investor.verification_submitted", async (payload) => {
  const { userId } = payload as { userId: string };
  await openSupportTicket(userId, `Vérification investisseur à effectuer : ${userId}`);
});

registerHandler("investor.verified", async (payload) => {
  const { userId } = payload as { userId: string };
  await notify(userId, "investor.verified", "email");
});

registerHandler("investor.rejected", async (payload) => {
  const { userId, reason } = payload as { userId: string; reason: string };
  console.log(`[notifications] vérification investisseur rejetée pour ${userId} : ${reason}`);
  await notify(userId, "investor.rejected", "email");
});

// --- Demande de document par le super administrateur (§ demande produit) ---

registerHandler("document.requested", async (payload) => {
  const { targetUserId, label } = payload as { targetUserId: string; label: string };
  await notify(targetUserId, "document.requested", "email"); // "un document t'a été demandé : ${label}"
  console.log(`[notifications] document demandé à ${targetUserId} : ${label}`);
});

registerHandler("document.request_fulfilled", async (payload) => {
  const { requestId, targetUserId } = payload as { requestId: string; targetUserId: string };
  await openSupportTicket(targetUserId, `Document déposé en réponse à une demande : ${requestId}`);
});

// --- Alertes automatiques Premium sur nouveaux dossiers (§ demande produit) -

const RISK_RANK: Record<string, number> = { low: 0, moderate: 1, high: 2 };

registerHandler("funding.opened", async (payload) => {
  const { opportunityId } = payload as { opportunityId: string };
  const opportunity = await prisma.fundingOpportunity.findUnique({
    where: { id: opportunityId },
    include: { loan: { include: { offer: { include: { application: true } } } } },
  });
  if (!opportunity) return;

  const premiumInvestors = await usersRepo.listActivePremiumInvestors();
  const opportunityRank = RISK_RANK[opportunity.riskLevel] ?? 1;
  const matching = premiumInvestors.filter((profile) => (RISK_RANK[profile.riskTolerance] ?? 1) >= opportunityRank);

  for (const profile of matching) {
    await notify(profile.userId, "funding.match_alert", "email");
  }
  if (matching.length > 0) {
    console.log(
      `[notifications] alerte "${opportunity.loan.offer.application.purpose}" envoyée à ${matching.length} investisseur(s) Premium`
    );
  }
});

// --- Relance automatique SLA "Dossier Prioritaire" (§ demande produit) -----

registerHandler("application.sla_breached", async (payload) => {
  const { applicationId, reference, borrowerId } = payload as {
    applicationId: string;
    reference: string;
    borrowerId: string;
  };
  await openSupportTicket(
    borrowerId,
    `URGENT — SLA 48h dépassé sur le dossier prioritaire ${reference} (${applicationId})`
  );
});
