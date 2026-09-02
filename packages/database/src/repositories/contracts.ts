import { prisma } from "../client";

export function create(data: { loanId: string; templateVersion: string; storageKey: string }) {
  return prisma.contract.create({ data });
}

export function findById(id: string) {
  return prisma.contract.findUnique({ where: { id } });
}

export function findByLoanId(loanId: string) {
  return prisma.contract.findUnique({ where: { loanId } });
}

export function attachSignature(contractId: string, signatureId: string) {
  return prisma.contract.update({ where: { id: contractId }, data: { signature: { connect: { id: signatureId } } } });
}
