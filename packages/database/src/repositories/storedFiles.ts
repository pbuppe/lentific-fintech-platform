import { prisma } from "../client";

export function create(storageKey: string, content: Buffer) {
  return prisma.storedFile.create({ data: { storageKey, content } });
}

export function findByKey(storageKey: string) {
  return prisma.storedFile.findUnique({ where: { storageKey } });
}
