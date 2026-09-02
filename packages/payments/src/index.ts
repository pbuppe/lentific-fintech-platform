/**
 * packages/payments : interface Stripe interchangeable (référence, §19).
 * Stripe Connect gère nativement la répartition d'un paiement entre plusieurs
 * investisseurs, ce qui correspond au financement fractionné.
 */
import { paymentsRepo, fundingRepo, subscriptionsRepo, applicationsRepo } from "@fintech/database";
import { emit } from "@fintech/workflow";

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
// Option "Dossier Prioritaire" (49 €, payée d'avance au dépôt, jamais un
// success-fee) : voir §schema Application.priority.
// ---------------------------------------------------------------------------

export async function recordPriorityFee(userId: string, applicationId: string, amount: number, currencyId: string) {
  await activeProvider.charge({ userId, amount, currency: currencyId });
  const payment = await paymentsRepo.record({ userId, amount, currencyId, type: "fee", provider: activeProvider.name });
  await paymentsRepo.updateStatus(payment.id, "COMPLETED");
  const slaDeadline = new Date(Date.now() + PRIORITY_SLA_HOURS * 60 * 60 * 1000);
  await applicationsRepo.setPriority(applicationId, slaDeadline);
  await emit("payment.received", { paymentId: payment.id, type: "fee" });
  return payment;
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
  const due = await subscriptionsRepo.listDue(new Date());
  for (const subscription of due) {
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
  return due.length;
}
