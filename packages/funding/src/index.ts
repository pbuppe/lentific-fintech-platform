/**
 * packages/funding : opportunités P2P, répartition entre investisseurs (§18, §19).
 * Le financement fractionné (plusieurs investisseurs sur un même prêt) est
 * porté par fundingRepo.invest, transactionnel côté base de données.
 */
import { fundingRepo, loansRepo, applicationsRepo, investorListingsRepo } from "@fintech/database";
import { riskLevelFromScore } from "@fintech/risk";
import { emit, registerHandler } from "@fintech/workflow";

export function listOpportunities() {
  return fundingRepo.listOpenOpportunities();
}

export function getPortfolio(investorId: string) {
  return fundingRepo.getPortfolio(investorId);
}

export function listInvestments(investorId: string) {
  return fundingRepo.listInvestmentsForInvestor(investorId);
}

/**
 * Capitaux disponibles publiés par un investisseur ("j'ai 100 000 € à prêter
 * à tel taux"), sens inverse d'une FundingOpportunity : ici c'est le
 * capital qui est publié en premier, avant qu'aucun dossier ne s'en serve.
 * Purement déclaratif pour l'instant (§ décision produit) : pas encore de
 * réservation automatique du montant lors d'un rapprochement avec une demande.
 */
export function publishInvestorListing(
  investorId: string,
  input: { amountAvailable: number; preferredRate: number; preferredDurationMonths: number; riskAppetite: "low" | "moderate" | "high" }
) {
  return investorListingsRepo.create({ investorId, ...input });
}

export function listOpenInvestorListings() {
  return investorListingsRepo.listOpen();
}

export function listInvestorListingsFor(investorId: string) {
  return investorListingsRepo.listForInvestor(investorId);
}

export function closeInvestorListing(id: string) {
  return investorListingsRepo.setStatus(id, "CLOSED");
}

export function openOpportunity(loanId: string, targetAmount: number, riskLevel: "low" | "moderate" | "high") {
  return fundingRepo.createOpportunity(loanId, targetAmount, riskLevel);
}

export async function invest(opportunityId: string, investorId: string, amount: number) {
  const result = await fundingRepo.invest(opportunityId, investorId, amount);

  await emit("investment.created", {
    opportunityId,
    investorId,
    amount,
    fullyFunded: result.opportunity.fundedAmount.toString() === result.opportunity.targetAmount.toString(),
  });

  return result;
}

// Une fois le contrat signé confirmé, le prêt devient finançable sur la
// marketplace P2P (§18), c'est le premier moment où un investisseur peut le
// voir, bien après que l'emprunteur a lui-même accepté son offre (§17).
registerHandler("contract.signed", async (payload) => {
  const { loanId } = payload as { loanId?: string };
  if (!loanId) return;

  const loan = await loansRepo.findById(loanId);
  if (!loan) return;

  const application = await applicationsRepo.findById(loan.offer.applicationId);
  const riskLevel = application?.score != null ? riskLevelFromScore(application.score) : "moderate";

  const opportunity = await openOpportunity(loanId, Number(loan.offer.amount), riskLevel);
  await emit("funding.opened", { loanId, opportunityId: opportunity.id });
});
