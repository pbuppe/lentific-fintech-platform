import { prisma, subscriptionsRepo } from "@fintech/database";
import { requestAndPayIntroduction, prepareIntroduction, INTRODUCTION_FEE } from "@fintech/introductions";
import { isPaypalConfigured } from "@fintech/payments";
import { beginPaypalPayment, type PaypalBack } from "./paypalCheckout";

/**
 * Demande de mise en relation : gratuite pour un abonné Premium, sinon payée
 * 14,90 € via PayPal (ou paiement simulé si PayPal n'est pas branché).
 * Renvoie l'adresse PayPal où envoyer le client, ou ce qui a déjà été réglé
 * (« paid » : payée, « included » : incluse dans l'abonnement Premium).
 */
export async function requestIntroduction(input: {
  userId: string;
  targetUserId: string;
  targetType: "APPLICATION" | "INVESTOR_LISTING";
  targetId: string;
  back: PaypalBack;
}): Promise<{ redirectTo: string } | { done: "paid" | "included" }> {
  const eur = await prisma.currency.findUniqueOrThrow({ where: { code: "EUR" } });
  if (!isPaypalConfigured()) {
    await requestAndPayIntroduction({
      requesterId: input.userId,
      targetUserId: input.targetUserId,
      targetType: input.targetType,
      targetId: input.targetId,
      currencyId: eur.id,
    });
    return { done: (await subscriptionsRepo.findForUser(input.userId))?.status === "ACTIVE" ? "included" : "paid" };
  }
  const prepared = await prepareIntroduction({
    requesterId: input.userId,
    targetUserId: input.targetUserId,
    targetType: input.targetType,
    targetId: input.targetId,
  });
  if (prepared.status === "paid") {
    return { done: (await subscriptionsRepo.findForUser(input.userId))?.status === "ACTIVE" ? "included" : "paid" };
  }
  const redirectTo = await beginPaypalPayment({
    userId: input.userId,
    amount: INTRODUCTION_FEE,
    currencyId: eur.id,
    purpose: "introduction",
    targetId: prepared.requestId,
    reference: prepared.requestId.slice(-6).toUpperCase(),
    back: input.back,
  });
  return { redirectTo };
}
