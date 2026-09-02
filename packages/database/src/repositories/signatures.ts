import { prisma } from "../client";
import type { SignatureStatus } from "@prisma/client";

export function create(data: { contractId: string; provider: string }) {
  return prisma.signature.create({ data });
}

export function findByContract(contractId: string) {
  return prisma.signature.findUnique({ where: { contractId } });
}

export function setStatus(signatureId: string, status: SignatureStatus, signedAt?: Date) {
  return prisma.signature.update({ where: { id: signatureId }, data: { status, signedAt } });
}
