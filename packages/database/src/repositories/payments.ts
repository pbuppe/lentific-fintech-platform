import { prisma } from "../client";
import type { PaymentStatus } from "@prisma/client";

export function record(data: {
  userId: string;
  loanId?: string;
  amount: number;
  currencyId: string;
  type: "disbursement" | "repayment" | "fee" | "payout" | "subscription";
  provider: string;
}) {
  return prisma.payment.create({ data });
}

export function updateStatus(paymentId: string, status: PaymentStatus) {
  return prisma.payment.update({ where: { id: paymentId }, data: { status } });
}

export function markRepaymentPaid(repaymentId: string, paidAt: Date) {
  return prisma.repayment.update({
    where: { id: repaymentId },
    data: { status: "PAID", paidAt },
  });
}

export function findRepaymentById(repaymentId: string) {
  return prisma.repayment.findUnique({ where: { id: repaymentId } });
}

/** Échéances encore à encaisser, pour la file d'attente back-office. */
export function listScheduledRepayments() {
  return prisma.repayment.findMany({
    where: { status: "SCHEDULED" },
    include: { loan: { include: { offer: { include: { application: true } } } } },
    orderBy: { dueDate: "asc" },
  });
}

// ---------------------------------------------------------------------------
// Paiement en ligne (PayPal) : un Payment PENDING est créé avant la redirection
// vers PayPal, puis passé COMPLETED après capture (ou FAILED si abandon).
// ---------------------------------------------------------------------------

export function createPending(data: {
  userId: string;
  amount: number;
  currencyId: string;
  type: "fee" | "subscription";
  provider: string;
  purpose: string;
  targetId: string;
}) {
  return prisma.payment.create({ data: { ...data, status: "PENDING" } });
}

export function setProviderRef(paymentId: string, providerRef: string) {
  return prisma.payment.update({ where: { id: paymentId }, data: { providerRef } });
}

export function findByProviderRef(providerRef: string) {
  return prisma.payment.findUnique({ where: { providerRef }, include: { currency: true } });
}

/** Passe un paiement PENDING à COMPLETED une seule fois (renvoie false s'il l'était déjà). */
export async function completeOnce(paymentId: string) {
  const res = await prisma.payment.updateMany({
    where: { id: paymentId, status: "PENDING" },
    data: { status: "COMPLETED", capturedAt: new Date() },
  });
  return res.count === 1;
}

export function failIfPending(paymentId: string) {
  return prisma.payment.updateMany({ where: { id: paymentId, status: "PENDING" }, data: { status: "FAILED" } });
}
