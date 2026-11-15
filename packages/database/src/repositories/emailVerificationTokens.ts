import { prisma } from "../client";

export function create(userId: string, tokenHash: string, expiresAt: Date) {
  return prisma.emailVerificationToken.create({ data: { userId, tokenHash, expiresAt } });
}

export function findByHash(tokenHash: string) {
  return prisma.emailVerificationToken.findUnique({ where: { tokenHash }, include: { user: true } });
}

export function markUsed(id: string) {
  return prisma.emailVerificationToken.update({ where: { id }, data: { usedAt: new Date() } });
}

/** Invalide les anciens liens quand un nouveau est envoyé. */
export function invalidateAllForUser(userId: string) {
  return prisma.emailVerificationToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });
}
