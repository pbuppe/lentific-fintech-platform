import { prisma } from "../client";

export function findById(id: string) {
  return prisma.loan.findUnique({
    where: { id },
    include: { repayments: true, fundingOpportunity: true, offer: true },
  });
}

export function createFromOffer(offerId: string) {
  return prisma.loan.create({ data: { offerId } });
}

export function attachContract(loanId: string, contractId: string) {
  return prisma.loan.update({ where: { id: loanId }, data: { contractId } });
}

export function generateRepaymentSchedule(
  loanId: string,
  schedule: { dueDate: Date; amount: number }[]
) {
  return prisma.repayment.createMany({
    data: schedule.map((r) => ({ loanId, dueDate: r.dueDate, amount: r.amount })),
  });
}
