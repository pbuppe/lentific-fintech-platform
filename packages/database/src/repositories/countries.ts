import { prisma } from "../client";

export function findByCode(code: string) {
  return prisma.country.findUnique({ where: { code } });
}
