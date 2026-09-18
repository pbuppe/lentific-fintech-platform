import { prisma } from "../client";

export function create(data: { userId?: string; action: string; entity: string; before?: object; after?: object }) {
  return prisma.auditLog.create({ data });
}
