import { prisma } from "../client";

export function findByKey(key: string) {
  return prisma.rule.findUnique({ where: { key } });
}

export function listEnabled() {
  return prisma.rule.findMany({ where: { enabled: true } });
}

export function upsert(key: string, scope: object, value: object, enabled = true) {
  return prisma.rule.upsert({
    where: { key },
    create: { key, scope, value, enabled },
    update: { scope, value, enabled },
  });
}
