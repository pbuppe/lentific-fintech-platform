import { prisma } from "../client";

export function listOpenOpportunities() {
  return prisma.fundingOpportunity.findMany({
    include: { loan: { include: { offer: { include: { application: true } } } } },
  });
}

export function createOpportunity(loanId: string, targetAmount: number, riskLevel: string) {
  return prisma.fundingOpportunity.create({
    data: { loanId, targetAmount, riskLevel },
  });
}

/**
 * Enregistre un investissement et met à jour le montant financé de l'opportunité,
 * dans une transaction pour garantir la cohérence (financement fractionné, §19).
 */
export async function invest(opportunityId: string, investorId: string, amount: number) {
  return prisma.$transaction(async (tx) => {
    const investment = await tx.investment.create({
      data: { opportunityId, investorId, amount },
    });
    const opportunity = await tx.fundingOpportunity.update({
      where: { id: opportunityId },
      data: { fundedAmount: { increment: amount } },
    });
    await tx.portfolio.upsert({
      where: { investorId },
      create: { investorId, totalInvested: amount },
      update: { totalInvested: { increment: amount } },
    });
    return { investment, opportunity };
  });
}

export function getPortfolio(investorId: string) {
  return prisma.portfolio.findUnique({ where: { investorId } });
}

export function listInvestmentsForInvestor(investorId: string) {
  return prisma.investment.findMany({
    where: { investorId },
    include: { opportunity: { include: { loan: { include: { offer: { include: { application: true } } } } } } },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Répartit un remboursement reçu sur un prêt entre tous les investisseurs qui
 * l'ont financé, au prorata de leur part du montant financé (financement
 * fractionné, §19). Alimente Portfolio.totalReceived, jusqu'ici jamais mis à
 * jour, ce qui rend le rendement affiché à l'investisseur enfin réel.
 */
export async function distributeRepayment(loanId: string, repaymentAmount: number) {
  const opportunity = await prisma.fundingOpportunity.findUnique({ where: { loanId } });
  if (!opportunity || Number(opportunity.fundedAmount) <= 0) return;

  const investments = await prisma.investment.findMany({ where: { opportunityId: opportunity.id } });
  const fundedAmount = Number(opportunity.fundedAmount);

  await prisma.$transaction(
    investments.map((investment) => {
      const share = Number(investment.amount) / fundedAmount;
      return prisma.portfolio.upsert({
        where: { investorId: investment.investorId },
        create: { investorId: investment.investorId, totalReceived: repaymentAmount * share },
        update: { totalReceived: { increment: repaymentAmount * share } },
      });
    })
  );
}
