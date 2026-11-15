import { prisma } from "../client";
import type { FundsAvailability, FundsBeneficiary } from "@prisma/client";

/** Dossiers concernés par le versement : contrat signé (à verser) ou déjà versés. */
export function listFundingCases() {
  return prisma.application.findMany({
    where: { status: { in: ["CONTRACT_SIGNED", "DISBURSED"] } },
    include: {
      borrower: { select: { id: true, name: true, email: true } },
      offers: { where: { status: "ACCEPTED" } },
      currency: true,
      disbursement: true,
      brokerFees: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function findByApplication(applicationId: string) {
  return prisma.disbursement.findUnique({ where: { applicationId } });
}

export function countDeclared() {
  return prisma.disbursement.count({ where: { status: "DECLARED" } });
}

export function upsertDeclaration(data: {
  applicationId: string;
  beneficiary: FundsBeneficiary;
  availability: FundsAvailability;
  fundsDate: Date;
  lenderReference: string;
  proofStorageKey: string;
  proofFileName: string;
  declaredById: string;
}) {
  const fields = {
    ...data,
    status: "DECLARED" as const,
    declaredAt: new Date(),
    confirmedById: null,
    confirmedAt: null,
    rejectionReason: null,
    availableAt: data.availability === "AVAILABLE" ? new Date() : null,
  };
  return prisma.disbursement.upsert({
    where: { applicationId: data.applicationId },
    create: fields,
    update: fields,
  });
}

export function markConfirmed(applicationId: string, confirmedById: string) {
  return prisma.disbursement.update({
    where: { applicationId },
    data: { status: "CONFIRMED", confirmedById, confirmedAt: new Date() },
  });
}

export function markRejected(applicationId: string, reason: string) {
  return prisma.disbursement.update({
    where: { applicationId },
    data: { status: "REJECTED", rejectionReason: reason },
  });
}

export function markAvailable(applicationId: string) {
  return prisma.disbursement.update({
    where: { applicationId },
    data: { availability: "AVAILABLE", availableAt: new Date() },
  });
}

// --- Honoraires de courtage --------------------------------------------------

export function createFeeRequest(data: {
  applicationId: string;
  userId: string;
  kind: string;
  amount: number;
  dueDate: Date;
  createdById: string;
}) {
  return prisma.brokerFeeRequest.create({ data });
}

export function findFeeRequest(id: string) {
  return prisma.brokerFeeRequest.findUnique({ where: { id }, include: { application: true } });
}

export function markFeePaid(id: string, paymentId: string) {
  return prisma.brokerFeeRequest.update({
    where: { id },
    data: { status: "PAID", paidAt: new Date(), paymentId },
  });
}

export function cancelFeeRequest(id: string) {
  return prisma.brokerFeeRequest.update({ where: { id }, data: { status: "CANCELLED" } });
}

export function listFeesForUser(userId: string) {
  return prisma.brokerFeeRequest.findMany({
    where: { userId, status: { not: "CANCELLED" } },
    orderBy: { createdAt: "desc" },
  });
}

export function listAuditForApplication(applicationId: string) {
  return prisma.auditLog.findMany({
    where: { entity: `Application:${applicationId}` },
    include: { user: { select: { name: true, email: true, role: true } } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}
