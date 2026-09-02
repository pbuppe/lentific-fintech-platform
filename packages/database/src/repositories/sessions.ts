import { prisma } from "../client";

export function create(userId: string, token: string, expiresAt: Date) {
  return prisma.session.create({ data: { userId, token, expiresAt } });
}

export function findByToken(token: string) {
  return prisma.session.findUnique({ where: { token }, include: { user: true } });
}

export function deleteByToken(token: string) {
  return prisma.session.deleteMany({ where: { token } });
}
