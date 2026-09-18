import { prisma } from "../client";

// countryCode filtre par pays de la demande (§ marketplace géographique :
// afficher en priorité les dossiers du pays du visiteur), undefined = tous
// pays confondus (bascule "International" côté marketplace).
export function listOpenOpportunities(countryCode?: string) {
  return prisma.fundingOpportunity.findMany({
    where: countryCode ? { loan: { offer: { application: { country: { code: countryCode } } } } } : undefined,
    include: {
      loan: { include: { offer: { include: { application: { include: { country: true, currency: true } } } } } },
    },
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

// Utilisé pour détecter un prêt financé par un seul investisseur (§ demande
// produit 2026-09-18 : contrat bilatéral alternatif au contrat marketplace
// multi-prêteurs standard). include: investor pour connaître son identité
// sans requête supplémentaire.
export function listInvestmentsForOpportunity(opportunityId: string) {
  return prisma.investment.findMany({
    where: { opportunityId },
    include: { investor: true },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Opportunités financées par exactement un investisseur, contrat déjà émis
 * (§ demande produit 2026-09-18) : liste affichée au back-office pour
 * proposer la régénération en contrat bilatéral. Le SQL brut est nécessaire
 * ici, Prisma ne sait pas filtrer sur "exactement N lignes liées" côté
 * relation en un seul findMany.
 */
export async function listSingleInvestorOpportunities() {
  const rows = await prisma.$queryRaw<{ opportunityId: string; loanId: string }[]>`
    SELECT o."id" as "opportunityId", o."loanId" as "loanId"
    FROM "FundingOpportunity" o
    JOIN "Loan" l ON l."id" = o."loanId"
    WHERE l."contractId" IS NOT NULL
    AND (SELECT count(DISTINCT i."investorId") FROM "Investment" i WHERE i."opportunityId" = o."id") = 1
  `;
  if (rows.length === 0) return [];

  const loans = await prisma.loan.findMany({
    where: { id: { in: rows.map((r) => r.loanId) } },
    include: { offer: { include: { application: { include: { borrower: true } } } } },
  });
  const investorByOpportunity = new Map<string, { id: string; name: string | null; email: string }>();
  const investments = await prisma.investment.findMany({
    where: { opportunityId: { in: rows.map((r) => r.opportunityId) } },
    include: { investor: true },
  });
  for (const inv of investments) investorByOpportunity.set(inv.opportunityId, inv.investor);

  return rows
    .map((r) => {
      const loan = loans.find((l) => l.id === r.loanId);
      const investor = investorByOpportunity.get(r.opportunityId);
      if (!loan || !investor) return null;
      return { loan, investor };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
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
