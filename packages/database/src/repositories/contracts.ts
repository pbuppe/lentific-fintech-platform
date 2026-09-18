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

// Régénération en contrat bilatéral quand un prêt marketplace se trouve
// financé par un seul investisseur (§ demande produit 2026-09-18) : remplace
// le PDF standard multi-prêteurs par la version bilatérale, mêmes id/loanId,
// juste un nouveau storageKey/version.
export function updateStorageKey(contractId: string, storageKey: string, templateVersion: string) {
  return prisma.contract.update({ where: { id: contractId }, data: { storageKey, templateVersion } });
}
