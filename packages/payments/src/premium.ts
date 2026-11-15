/**
 * Formule Investisseur Premium payée par abonnement PayPal.
 *
 * - Souscription : le client approuve l'abonnement sur PayPal ; au retour on
 *   relit la souscription chez PayPal et on active Premium.
 * - Renouvellements : PayPal prélève lui-même chaque mois. Le site relit l'état
 *   de la souscription (balayage automatique + affichage de la page Premium) :
 *   nouveau prélèvement → période prolongée et paiement enregistré ; échec →
 *   « paiement échoué » ; résiliation faite depuis le compte PayPal → prise en compte.
 * - Résiliation : arrête les prélèvements chez PayPal, Premium reste actif
 *   jusqu'à la fin de la période déjà payée.
 * - Réactivation pendant une période déjà payée : la nouvelle souscription ne
 *   démarre qu'à la fin de cette période (jamais deux paiements pour le même mois).
 */
import { paymentsRepo, subscriptionsRepo, providerSettingsRepo, prisma } from "@fintech/database";
import { emit } from "@fintech/workflow";
import {
  paypalMode,
  createPaypalProduct,
  createPaypalMonthlyPlan,
  createPaypalSubscription,
  getPaypalSubscription,
  cancelPaypalSubscription,
  type PaypalSubscriptionState,
} from "./paypal";

export const PREMIUM_TIER = "INVESTOR_PREMIUM";
export const PREMIUM_MONTHLY_AMOUNT = 15;
const DAY = 24 * 60 * 60 * 1000;
const BILLING_GRACE_MS = 3 * DAY; // délai laissé à PayPal pour prélever avant « paiement échoué »

export class PremiumError extends Error {
  constructor(public readonly code: "already_active") {
    super(code);
  }
}

async function ensurePremiumPlan(currency: string) {
  const key = `paypal:${paypalMode()}:premium-plan:${currency}:${PREMIUM_MONTHLY_AMOUNT}`;
  const existing = await providerSettingsRepo.get(key);
  if (existing) return existing;
  const productKey = `paypal:${paypalMode()}:premium-product`;
  let productId = await providerSettingsRepo.get(productKey);
  if (!productId) {
    productId = await createPaypalProduct("SODIVA CREDITS · Formule Premium");
    await providerSettingsRepo.set(productKey, productId);
  }
  const planId = await createPaypalMonthlyPlan({
    productId,
    name: `Formule Premium (${PREMIUM_MONTHLY_AMOUNT} ${currency} / mois)`,
    amount: PREMIUM_MONTHLY_AMOUNT,
    currency,
  });
  await providerSettingsRepo.set(key, planId);
  return planId;
}

/** Crée la souscription PayPal et renvoie l'adresse où le client l'approuve. */
export async function startPremiumCheckout(input: {
  userId: string;
  currencyId: string;
  currencyCode: string;
  returnUrl: string;
  cancelUrl: string;
  locale?: string;
}) {
  const current = await subscriptionsRepo.findForUser(input.userId);
  if (current?.status === "ACTIVE" && !current.cancelledAt) throw new PremiumError("already_active");
  // Période déjà payée en cours (résilié mais encore actif) : démarrage différé à sa fin.
  const paidUntil = current?.status === "ACTIVE" && current.currentPeriodEnd.getTime() > Date.now() + 10 * 60 * 1000 ? current.currentPeriodEnd : undefined;

  const planId = await ensurePremiumPlan(input.currencyCode);
  const payment = await paymentsRepo.createPending({
    userId: input.userId,
    amount: PREMIUM_MONTHLY_AMOUNT,
    currencyId: input.currencyId,
    type: "subscription",
    provider: "paypal",
    purpose: "premium",
    targetId: input.userId,
  });
  try {
    const { subscriptionId, approveUrl } = await createPaypalSubscription({
      planId,
      customId: payment.id,
      returnUrl: input.returnUrl,
      cancelUrl: input.cancelUrl,
      locale: input.locale,
      startTime: paidUntil,
    });
    await paymentsRepo.setProviderRef(payment.id, subscriptionId);
    return approveUrl;
  } catch (error) {
    await paymentsRepo.failIfPending(payment.id);
    throw error;
  }
}

/**
 * Enregistre le dernier prélèvement PayPal d'une souscription, une seule fois.
 * Le premier prélèvement « complète » le paiement créé au moment de la souscription.
 */
async function recordCharge(subscriptionId: string, userId: string, state: PaypalSubscriptionState) {
  const charge = state.lastPayment;
  if (!charge) return false;
  const key = `${subscriptionId}@${charge.time.toISOString()}`;
  if (await paymentsRepo.findByProviderRef(key)) return false;
  const currency = await prisma.currency.findUnique({ where: { code: charge.currency } });
  if (!currency) return false;
  const checkout = await paymentsRepo.findByProviderRef(subscriptionId);
  let paymentId: string;
  if (checkout && checkout.status === "PENDING") {
    const updated = await prisma.payment.update({
      where: { id: checkout.id },
      data: { providerRef: key, status: "COMPLETED", capturedAt: charge.time, amount: charge.amount, currencyId: currency.id },
    });
    paymentId = updated.id;
  } else {
    try {
      const created = await prisma.payment.create({
        data: {
          userId, amount: charge.amount, currencyId: currency.id, type: "subscription", provider: "paypal",
          status: "COMPLETED", providerRef: key, purpose: "premium", targetId: userId, capturedAt: charge.time,
        },
      });
      paymentId = created.id;
    } catch {
      return false; // enregistré en parallèle par un autre passage
    }
  }
  await emit("payment.received", { paymentId, type: "subscription" });
  return true;
}

export type PremiumCheckoutResult =
  | { ok: true; deferred: boolean; firstTime: boolean }
  | { ok: false; reason: "unknown" | "not_owner" | "not_approved" };

/** Au retour de PayPal : vérifie la souscription chez PayPal puis active Premium. Rejouable sans risque. */
export async function completePremiumCheckout(subscriptionId: string, userId: string): Promise<PremiumCheckoutResult> {
  const already = await subscriptionsRepo.findByProviderRef(subscriptionId);
  if (already) {
    if (already.userId !== userId) return { ok: false, reason: "not_owner" };
    return { ok: true, deferred: false, firstTime: false };
  }
  const checkout = await paymentsRepo.findByProviderRef(subscriptionId);
  if (!checkout || checkout.purpose !== "premium") return { ok: false, reason: "unknown" };
  if (checkout.userId !== userId) return { ok: false, reason: "not_owner" };

  const state = await getPaypalSubscription(subscriptionId);
  if (state.customId && state.customId !== checkout.id) return { ok: false, reason: "unknown" };
  if (state.status !== "ACTIVE" && state.status !== "APPROVED") return { ok: false, reason: "not_approved" };

  const current = await subscriptionsRepo.findForUser(userId);
  const deferred = Boolean(current?.status === "ACTIVE" && current.currentPeriodEnd.getTime() > Date.now() && current.cancelledAt);
  const periodEnd = deferred
    ? current!.currentPeriodEnd
    : state.nextBillingTime && state.nextBillingTime.getTime() > Date.now()
      ? state.nextBillingTime
      : new Date(Date.now() + 30 * DAY);

  // Ancienne souscription PayPal (suspendue, résiliée…) : on s'assure qu'elle ne prélèvera plus jamais.
  if (current?.provider === "paypal" && current.providerRef && current.providerRef !== subscriptionId) {
    await cancelPaypalSubscription(current.providerRef, "Remplacée par un nouvel abonnement SODIVA CREDITS").catch((error) =>
      console.error("[payments:paypal] arrêt de l'ancienne souscription impossible", error)
    );
  }

  await subscriptionsRepo.activatePaypal({
    userId,
    tier: PREMIUM_TIER,
    amount: PREMIUM_MONTHLY_AMOUNT,
    providerRef: subscriptionId,
    currentPeriodEnd: periodEnd,
  });
  if (deferred) {
    // Rien n'est prélevé maintenant : le paiement « en attente » n'a pas lieu d'être.
    await prisma.payment.deleteMany({ where: { id: checkout.id, status: "PENDING" } });
  } else {
    await recordCharge(subscriptionId, userId, state);
  }
  await emit("subscription.started", { userId, tier: PREMIUM_TIER });
  return { ok: true, deferred, firstTime: true };
}

/** Le client a annulé sur la page PayPal : rien n'a été prélevé. */
export async function cancelPremiumCheckout(userId: string) {
  await prisma.payment.updateMany({ where: { userId, purpose: "premium", status: "PENDING" }, data: { status: "FAILED" } });
}

/** Résiliation : arrête les prélèvements chez PayPal ; Premium reste actif jusqu'à la fin de la période payée. */
export async function cancelPremium(userId: string) {
  const sub = await subscriptionsRepo.findForUser(userId);
  if (!sub) return null;
  if (sub.provider === "paypal" && sub.providerRef) {
    await cancelPaypalSubscription(sub.providerRef, "Résiliation demandée par le client depuis son espace SODIVA CREDITS");
  }
  const updated = await subscriptionsRepo.cancel(userId);
  await emit("subscription.cancelled", { userId });
  return updated;
}

/** Relit l'état d'un abonnement PayPal et met à jour le site en conséquence. */
export async function syncPaypalSubscription(subscriptionRowId: string) {
  const sub = await prisma.subscription.findUnique({ where: { id: subscriptionRowId } });
  if (!sub || sub.provider !== "paypal" || !sub.providerRef) return sub;
  const state = await getPaypalSubscription(sub.providerRef);
  const renewed = await recordCharge(sub.providerRef, sub.userId, state);
  const now = Date.now();

  let status = sub.status;
  let currentPeriodEnd = sub.currentPeriodEnd;
  let cancelledAt = sub.cancelledAt;

  if (state.status === "ACTIVE") {
    if (state.nextBillingTime && state.nextBillingTime > currentPeriodEnd) currentPeriodEnd = state.nextBillingTime;
    if (state.failedPayments > 0 && currentPeriodEnd.getTime() <= now) status = "PAST_DUE";
    else if (currentPeriodEnd.getTime() > now) status = "ACTIVE";
    else if (currentPeriodEnd.getTime() + BILLING_GRACE_MS <= now) status = "PAST_DUE";
  } else if (state.status === "APPROVED") {
    // Réactivation différée : la nouvelle souscription démarre à la fin de la période déjà payée.
    status = currentPeriodEnd.getTime() > now ? "ACTIVE" : status;
  } else if (state.status === "SUSPENDED") {
    status = "PAST_DUE";
  } else if (state.status === "CANCELLED" || state.status === "EXPIRED") {
    if (!cancelledAt) cancelledAt = new Date(); // résilié depuis le compte PayPal du client
    status = currentPeriodEnd.getTime() > now ? "ACTIVE" : "CANCELLED";
  }

  const changed = status !== sub.status || currentPeriodEnd.getTime() !== sub.currentPeriodEnd.getTime() || cancelledAt?.getTime() !== sub.cancelledAt?.getTime();
  const updated = await subscriptionsRepo.updateSync(sub.id, { status, currentPeriodEnd, cancelledAt });
  if (renewed && sub.status === "ACTIVE" && currentPeriodEnd > sub.currentPeriodEnd) await emit("subscription.renewed", { userId: sub.userId });
  if (changed && status === "PAST_DUE" && sub.status !== "PAST_DUE") console.warn(`[payments:paypal] prélèvement Premium en échec pour ${sub.userId}`);
  if (changed && status === "CANCELLED" && sub.status !== "CANCELLED") await emit("subscription.cancelled", { userId: sub.userId });
  return updated;
}

/** Relit l'abonnement d'un utilisateur s'il n'a pas été vérifié depuis maxAgeMs (affichage des pages). */
export async function refreshPremiumIfStale(userId: string, maxAgeMs = 60 * 1000) {
  const sub = await subscriptionsRepo.findForUser(userId);
  if (!sub || sub.provider !== "paypal") return sub;
  if (sub.lastSyncedAt && Date.now() - sub.lastSyncedAt.getTime() < maxAgeMs) return sub;
  try {
    return await syncPaypalSubscription(sub.id);
  } catch (error) {
    console.error("[payments:paypal] lecture de l'abonnement impossible", error);
    return sub;
  }
}

/** Abonnements PayPal à relire lors du balayage : arrivés à échéance ou pas vérifiés depuis 6 h. */
export function listPaypalSubscriptionsToSync(now = new Date()) {
  return prisma.subscription.findMany({
    where: {
      provider: "paypal",
      status: { in: ["ACTIVE", "PAST_DUE"] },
      OR: [{ currentPeriodEnd: { lte: now } }, { lastSyncedAt: null }, { lastSyncedAt: { lte: new Date(now.getTime() - 6 * 60 * 60 * 1000) } }],
    },
  });
}
