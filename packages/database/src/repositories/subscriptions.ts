import { prisma } from "../client";

export function findForUser(userId: string) {
  return prisma.subscription.findUnique({ where: { userId } });
}

export function create(data: { userId: string; tier: string; amount: number; currentPeriodEnd: Date }) {
  return prisma.subscription.upsert({
    where: { userId: data.userId },
    create: data,
    update: { tier: data.tier, amount: data.amount, currentPeriodEnd: data.currentPeriodEnd, status: "ACTIVE", cancelledAt: null },
  });
}

/** Résiliation "en fin de période" : reste actif jusqu'à currentPeriodEnd, ne se renouvelle plus ensuite. */
export function cancel(userId: string) {
  return prisma.subscription.update({ where: { userId }, data: { cancelledAt: new Date() } });
}

export function renew(id: string, currentPeriodEnd: Date) {
  return prisma.subscription.update({ where: { id }, data: { currentPeriodEnd, status: "ACTIVE" } });
}

export function setStatus(id: string, status: "ACTIVE" | "CANCELLED" | "PAST_DUE") {
  return prisma.subscription.update({ where: { id }, data: { status } });
}

/** Abonnements arrivés à échéance de leur période en cours, pour le balayage automatique. */
export function listDue(now: Date) {
  return prisma.subscription.findMany({
    where: { status: { in: ["ACTIVE", "PAST_DUE"] }, currentPeriodEnd: { lte: now } },
  });
}

// ---------------------------------------------------------------------------
// Abonnement PayPal (provider = "paypal", providerRef = identifiant I-… chez PayPal)
// ---------------------------------------------------------------------------

/** Active (ou réactive) l'abonnement PayPal d'un utilisateur. */
export function activatePaypal(data: { userId: string; tier: string; amount: number; providerRef: string; currentPeriodEnd: Date }) {
  const fields = {
    tier: data.tier,
    amount: data.amount,
    status: "ACTIVE" as const,
    cancelledAt: null,
    provider: "paypal",
    providerRef: data.providerRef,
    currentPeriodEnd: data.currentPeriodEnd,
    lastSyncedAt: new Date(),
  };
  return prisma.subscription.upsert({
    where: { userId: data.userId },
    create: { userId: data.userId, ...fields },
    update: fields,
  });
}

export function findByProviderRef(providerRef: string) {
  return prisma.subscription.findUnique({ where: { providerRef } });
}

export function updateSync(id: string, data: { status?: "ACTIVE" | "CANCELLED" | "PAST_DUE"; currentPeriodEnd?: Date; cancelledAt?: Date | null }) {
  return prisma.subscription.update({ where: { id }, data: { ...data, lastSyncedAt: new Date() } });
}
