/**
 * packages/introductions : mise en relation directe entre un demandeur de
 * crédit et un investisseur/prêteur (particulier, entreprise ou structure),
 * moyennant un frais fixe (15 € par défaut). Une fois payé, le contact
 * (email / téléphone) est révélé dans les deux sens (§ demande produit).
 *
 * Paiement simulé via @fintech/payments (mockPaymentProvider), comme le
 * reste de la plateforme, aucun prestataire réel branché pour l'instant.
 */
import { introductionsRepo, subscriptionsRepo, directLoanAgreementsRepo, type IntroductionTargetType } from "@fintech/database";
import { recordFee } from "@fintech/payments";
import { emit } from "@fintech/workflow";
import { generateDirectLoanContract } from "@fintech/contracts";

const DEFAULT_FEE = 15;

export async function requestAndPayIntroduction(input: {
  requesterId: string;
  targetUserId: string;
  targetType: IntroductionTargetType;
  targetId: string;
  currencyId: string;
  message?: string;
}) {
  if (input.requesterId === input.targetUserId) {
    throw new Error("Impossible de demander une mise en relation avec soi-même.");
  }

  const existing = await introductionsRepo.findExisting(input.requesterId, input.targetType, input.targetId);
  if (existing && existing.status === "PAID") {
    return existing;
  }

  const request =
    existing ??
    (await introductionsRepo.create({
      requesterId: input.requesterId,
      targetUserId: input.targetUserId,
      targetType: input.targetType,
      targetId: input.targetId,
      message: input.message,
    }));

  // Formule Premium (§ demande produit) : mises en relation illimitées, sans
  // frais à l'unité, tant que l'abonnement est actif.
  const subscription = await subscriptionsRepo.findForUser(input.requesterId);
  const isPremium = subscription?.status === "ACTIVE";
  if (!isPremium) {
    await recordFee(input.requesterId, DEFAULT_FEE, input.currencyId);
  }
  const paid = await introductionsRepo.setPaid(request.id);

  await emit("introduction.paid", {
    requestId: paid.id,
    requesterId: input.requesterId,
    targetUserId: input.targetUserId,
    targetType: input.targetType,
    targetId: input.targetId,
  });

  return paid;
}

export function listSentBy(userId: string) {
  return introductionsRepo.listSentBy(userId);
}

export function listReceivedBy(userId: string) {
  return introductionsRepo.listReceivedBy(userId);
}

export function findExisting(requesterId: string, targetType: IntroductionTargetType, targetId: string) {
  return introductionsRepo.findExisting(requesterId, targetType, targetId);
}

export const INTRODUCTION_FEE = DEFAULT_FEE;

/**
 * Trigger 1 du contrat bilatéral direct (§ demande produit 2026-09-18) :
 * formalise en prêt, avec contrat généré immédiatement, un accord conclu
 * entre les deux parties d'une mise en relation déjà payée. Déterminé par le
 * rôle (BORROWER/INVESTOR) plutôt que par qui a demandé le contact, une
 * mise en relation peut être initiée dans les deux sens.
 */
export async function formalizeDirectLoan(input: {
  introductionRequestId: string;
  requestingUserId: string; // qui soumet le formulaire, pour vérifier qu'il fait bien partie de la mise en relation
  amount: number;
  durationMonths: number;
  rate: number;
}) {
  const introduction = await introductionsRepo.findById(input.introductionRequestId);
  if (!introduction) throw new Error("Mise en relation introuvable.");
  if (introduction.status !== "PAID") {
    throw new Error("La mise en relation doit être payée avant de formaliser un prêt.");
  }
  if (introduction.requesterId !== input.requestingUserId && introduction.targetUserId !== input.requestingUserId) {
    throw new Error("Cette mise en relation ne vous concerne pas.");
  }
  if (introduction.directLoanAgreement) {
    throw new Error("Un prêt a déjà été formalisé pour cette mise en relation.");
  }

  const requesterIsBorrower = introduction.requester.role === "BORROWER";
  const borrowerId = requesterIsBorrower ? introduction.requesterId : introduction.targetUserId;
  const lenderId = requesterIsBorrower ? introduction.targetUserId : introduction.requesterId;

  const agreement = await directLoanAgreementsRepo.create({
    introductionRequestId: input.introductionRequestId,
    borrowerId,
    lenderId,
    amount: input.amount,
    durationMonths: input.durationMonths,
    rate: input.rate,
  });

  await generateDirectLoanContract(agreement.id);
  return agreement;
}
