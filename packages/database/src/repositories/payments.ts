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
