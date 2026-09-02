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
