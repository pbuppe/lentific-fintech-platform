/**
 * packages/audit : journal d'audit. Toute action sensible (changement de statut,
 * accès à un dossier, modification d'une règle) devrait être tracée ici.
 */
import { prisma } from "@fintech/database";

export function logAction(input: { userId?: string; action: string; entity: string; before?: object; after?: object }) {
  return prisma.auditLog.create({ data: input });
}

export function listForEntity(entity: string) {
  return prisma.auditLog.findMany({ where: { entity }, orderBy: { createdAt: "desc" } });
}
