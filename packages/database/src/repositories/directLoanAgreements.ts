import { prisma } from "../client";
import type { DirectLoanAgreementStatus } from "@prisma/client";

export function findByIntroduction(introductionRequestId: string) {
  return prisma.directLoanAgreement.findUnique({
    where: { introductionRequestId },
    include: { borrower: true, lender: true },
  });
}

export function findById(id: string) {
  return prisma.directLoanAgreement.findUnique({
    where: { id },
    include: { borrower: true, lender: true, introductionRequest: true },
  });
}

export function create(data: {
  introductionRequestId: string;
  borrowerId: string;
  lenderId: string;
  amount: number;
  durationMonths: number;
  rate: number;
}) {
  return prisma.directLoanAgreement.create({ data });
}

export function attachContract(id: string, storageKey: string) {
  return prisma.directLoanAgreement.update({
    where: { id },
    data: { status: "CONTRACT_GENERATED", contractStorageKey: storageKey, contractGeneratedAt: new Date() },
  });
}

export function markSigned(id: string, signatureStorageKey: string) {
  return prisma.directLoanAgreement.update({
    where: { id },
    data: { status: "SIGNED", signatureStorageKey, signedAt: new Date() },
  });
}

export function listForUser(userId: string) {
  return prisma.directLoanAgreement.findMany({
    where: { OR: [{ borrowerId: userId }, { lenderId: userId }] },
    include: { borrower: true, lender: true },
    orderBy: { createdAt: "desc" },
  });
}

export function setStatus(id: string, status: DirectLoanAgreementStatus) {
  return prisma.directLoanAgreement.update({ where: { id }, data: { status } });
}
