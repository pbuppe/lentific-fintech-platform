/**
 * packages/payments : interface Stripe interchangeable (référence, §19).
 * Stripe Connect gère nativement la répartition d'un paiement entre plusieurs
 * investisseurs, ce qui correspond au financement fractionné.
 */
import { paymentsRepo, fundingRepo, subscriptionsRepo, applicationsRepo } from "@fintech/database";
import { emit } from "@fintech/workflow";
import { createPaypalOrder, capturePaypalOrder, isPaypalConfigured } from "./paypal";
import { listPaypalSubscriptionsToSync, syncPaypalSubscription } from "./premium";

const SUBSCRIPTION_PERIOD_DAYS = 30;
const PRIORITY_SLA_HOURS = 48;

export interface PaymentProvider {
  name: string;
  charge(input: { userId: string; amount: number; currency: string }): Promise<{ providerRef: string }>;
  splitPayout(input: { totalAmount: number; recipients: { investorId: string; share: number }[] }): Promise<void>;
}

export const mockPaymentProvider: PaymentProvider = {
  name: "mock",
  async charge({ userId, amount, currency }) {
    console.log(`[payments:mock] charge ${amount} ${currency} pour ${userId}`);
    return { providerRef: `mock_ch_${Date.now()}` };
  },
  async splitPayout({ recipients }) {
    console.log(`[payments:mock] répartition vers ${recipients.length} investisseur(s)`);
  },
};

let activeProvider: PaymentProvider = mockPaymentProvider;

export function setPaymentProvider(provider: PaymentProvider) {
  activeProvider = provider;
}

export async function recordDisbursement(userId: string, loanId: string, amount: number, currencyId: string) {
  await activeProvider.charge({ userId, amount, currency: currencyId });
  const payment = await paymentsRepo.record({ userId, loanId, amount, currencyId, type: "disbursement", provider: activeProvider.name });
  await paymentsRepo.updateStatus(payment.id, "COMPLETED");
  await emit("payment.received", { paymentId: payment.id, loanId, type: "disbursement" });
  return payment;
}

export async function recordRepayment(userId: string, loanId: string, repaymentId: string, amount: number, currencyId: string) {
  await activeProvider.charge({ userId, amount, currency: currencyId });
  const payment = await paymentsRepo.record({ userId, loanId, amount, currencyId, type: "repayment", provider: activeProvider.name });
  await paymentsRepo.updateStatus(payment.id, "COMPLETED");
  await paymentsRepo.markRepaymentPaid(repaymentId, new Date());
  // Redistribue la somme entre tous les investisseurs du prêt, au prorata de
  // leur part (financement fractionné, §19) : c'est ce qui rend le rendement
  // affiché sur /investor/portfolio réel plutôt que figé à 0.
  await fundingRepo.distributeRepayment(loanId, amount);
  await emit("payment.received", { paymentId: payment.id, loanId, type: "repayment" });
  return payment;
}

// Frais fixe (ex. mise en relation directe, § demande produit), même schéma
// mock que les autres flux de paiement, pas de lien avec un prêt (loanId absent).
export async function recordFee(userId: string, amount: number, currencyId: string) {
  await activeProvider.charge({ userId, amount, currency: currencyId });
  const payment = await paymentsRepo.record({ userId, amount, currencyId, type: "fee", provider: activeProvider.name });
  await paymentsRepo.updateStatus(payment.id, "COMPLETED");
  await emit("payment.received", { paymentId: payment.id, type: "fee" });
  return payment;
}

// ---------------------------------------------------------------------------
// Option "Dossier Prioritaire" (49,90 €, payée d'avance au dépôt, jamais un
// success-fee) : voir §schema Application.priority.
// ---------------------------------------------------------------------------

export async function recordPriorityFee(userId: string, applicationId: string, amount: number, currencyId: string) {
  await activeProvider.charge({ userId, amount, currency: currencyId });
  const payment = await paymentsRepo.record({ userId, amount, currencyId, type: "fee", provider: activeProvider.name });
  await paymentsRepo.updateStatus(payment.id, "COMPLETED");
  await applyPriority(applicationId);
  await emit("payment.received", { paymentId: payment.id, type: "fee" });
  return payment;
}

/** Active l'option prioritaire (délai de traitement garanti) une fois payée. */
export async function applyPriority(applicationId: string) {
  const slaDeadline = new Date(Date.now() + PRIORITY_SLA_HOURS * 60 * 60 * 1000);
  await applicationsRepo.setPriority(applicationId, slaDeadline);
}

// ---------------------------------------------------------------------------
// Paiement en ligne PayPal (voir ./paypal.ts). Sans identifiants PayPal,
// isPaypalConfigured() est faux et les pages gardent le paiement simulé.
// ---------------------------------------------------------------------------

export { isPaypalConfigured, paypalMode, PaypalError } from "./paypal";
export {
  PREMIUM_TIER,
  BORROWER_PREMIUM_TIER,
  premiumTierFor,
  PREMIUM_MONTHLY_AMOUNT,
  PremiumError,
  startPremiumCheckout,
  completePremiumCheckout,
  cancelPremiumCheckout,
  cancelPremium,
  syncPaypalSubscription,
  refreshPremiumIfStale,
} from "./premium";

export type OnlinePurpose = "broker_fee" | "priority" | "introduction";

/** Crée le paiement en attente et la commande PayPal ; renvoie l'adresse de paiement PayPal. */
export async function startPaypalCheckout(input: {
  userId: string;
  amount: number;
  currencyId: string;
  currencyCode: string;
  purpose: OnlinePurpose;
  targetId: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  locale?: string;
}) {
  const payment = await paymentsRepo.createPending({
    userId: input.userId,
    amount: input.amount,
    currencyId: input.currencyId,
    type: "fee",
    provider: "paypal",
    purpose: input.purpose,
    targetId: input.targetId,
  });
  try {
    const { orderId, approveUrl } = await createPaypalOrder({
      amount: input.amount,
      currency: input.currencyCode,
      description: input.description,
      customId: payment.id,
      returnUrl: input.returnUrl,
      cancelUrl: input.cancelUrl,
      locale: input.locale,
    });
    await paymentsRepo.setProviderRef(payment.id, orderId);
    return approveUrl;
  } catch (error) {
    await paymentsRepo.failIfPending(payment.id);
    throw error;
  }
}

export type CheckoutResult =
  | { ok: true; purpose: OnlinePurpose; targetId: string; paymentId: string; firstTime: boolean }
  | { ok: false; reason: "unknown" | "not_owner" | "not_completed" | "captured_needs_review" };

/**
 * Au retour de PayPal : capture la commande et vérifie qu'elle appartient bien
 * au client connecté et que le montant encaissé est exactement celui attendu.
 * Rejouable sans risque (rechargement de la page de retour).
 */
export async function completePaypalCheckout(orderId: string, userId: string): Promise<CheckoutResult> {
  const payment = await paymentsRepo.findByProviderRef(orderId);
  if (!payment || !payment.purpose || !payment.targetId) return { ok: false, reason: "unknown" };
  if (payment.userId !== userId) return { ok: false, reason: "not_owner" };
  const base = { purpose: payment.purpose as OnlinePurpose, targetId: payment.targetId, paymentId: payment.id };
  if (payment.status === "COMPLETED") return { ok: true, ...base, firstTime: false };
  if (payment.status !== "PENDING") return { ok: false, reason: "not_completed" };

  const capture = await capturePaypalOrder(orderId);
  if (capture.status !== "COMPLETED" || capture.captureStatus !== "COMPLETED") return { ok: false, reason: "not_completed" };
  const refMismatch = capture.customId !== undefined && capture.customId !== payment.id;
  if (refMismatch || capture.currency !== payment.currency.code || capture.amount === null || Math.abs(capture.amount - Number(payment.amount)) > 0.005) {
    // L'argent a été encaissé par PayPal mais ne correspond pas à l'attendu :
    // on n'applique rien automatiquement, l'équipe doit vérifier.
    console.error(`[payments:paypal] montant ou référence inattendus pour la commande ${orderId} (paiement ${payment.id})`, capture);
    return { ok: false, reason: "captured_needs_review" };
  }
  const firstTime = await paymentsRepo.completeOnce(payment.id);
  if (firstTime) await emit("payment.received", { paymentId: payment.id, type: "fee" });
  return { ok: true, ...base, firstTime };
}

/** Le client a annulé sur la page PayPal : rien n'a été prélevé. */
export async function cancelPaypalCheckout(orderId: string, userId: string) {
  const payment = await paymentsRepo.findByProviderRef(orderId);
  if (payment && payment.userId === userId) await paymentsRepo.failIfPending(payment.id);
}

// ---------------------------------------------------------------------------
// Facturation récurrente (formule Investisseur Premium, 15 €/mois par défaut).
// ---------------------------------------------------------------------------

export async function subscribe(userId: string, tier: string, amount: number, currencyId: string) {
  await activeProvider.charge({ userId, amount, currency: currencyId });
  const payment = await paymentsRepo.record({ userId, amount, currencyId, type: "subscription", provider: activeProvider.name });
  await paymentsRepo.updateStatus(payment.id, "COMPLETED");
  const currentPeriodEnd = new Date(Date.now() + SUBSCRIPTION_PERIOD_DAYS * 24 * 60 * 60 * 1000);
  const subscription = await subscriptionsRepo.create({ userId, tier, amount, currentPeriodEnd });
  await emit("subscription.started", { userId, tier });
  return subscription;
}

export async function cancelSubscription(userId: string) {
  const subscription = await subscriptionsRepo.cancel(userId);
  await emit("subscription.cancelled", { userId });
  return subscription;
}

/**
 * Balayage périodique du prélèvement mensuel, appelé automatiquement par le
 * planificateur de instrumentation-node.ts (voir ce fichier pour l'intervalle).
 * Pour chaque abonnement arrivé à échéance : clôture s'il a été résilié,
 * sinon prélève le mois suivant et avance la période.
 */
export async function processDueSubscriptions(currencyId: string) {
  // 1) Abonnements PayPal : PayPal prélève lui-même, on relit leur état.
  let processed = 0;
  if (isPaypalConfigured()) {
    for (const sub of await listPaypalSubscriptionsToSync()) {
      try {
        await syncPaypalSubscription(sub.id);
        processed++;
      } catch (error) {
        console.error(`[payments:paypal] lecture de l'abonnement ${sub.id} impossible`, error);
      }
    }
  }

  // 2) Anciens abonnements simulés (sans PayPal).
  const due = (await subscriptionsRepo.listDue(new Date())).filter((s) => s.provider !== "paypal");
  for (const subscription of due) {
    // PayPal branché : un abonnement simulé ne peut pas être prélevé pour de vrai.
    // Il s'arrête à la fin de sa période ; le client peut se réabonner via PayPal.
    if (isPaypalConfigured()) {
      await subscriptionsRepo.setStatus(subscription.id, "CANCELLED");
      await emit("subscription.ended", { userId: subscription.userId, legacy: true });
      continue;
    }
    if (subscription.cancelledAt) {
      await subscriptionsRepo.setStatus(subscription.id, "CANCELLED");
      await emit("subscription.cancelled", { userId: subscription.userId });
      continue;
    }
    try {
      await activeProvider.charge({ userId: subscription.userId, amount: Number(subscription.amount), currency: currencyId });
      const payment = await paymentsRepo.record({
        userId: subscription.userId,
        amount: Number(subscription.amount),
        currencyId,
        type: "subscription",
        provider: activeProvider.name,
      });
      await paymentsRepo.updateStatus(payment.id, "COMPLETED");
      const currentPeriodEnd = new Date(Date.now() + SUBSCRIPTION_PERIOD_DAYS * 24 * 60 * 60 * 1000);
      await subscriptionsRepo.renew(subscription.id, currentPeriodEnd);
      await emit("subscription.renewed", { userId: subscription.userId });
    } catch (error) {
      await subscriptionsRepo.setStatus(subscription.id, "PAST_DUE");
      console.error(`[payments] échec du renouvellement pour ${subscription.userId}`, error);
    }
  }
  return processed + due.length;
}
