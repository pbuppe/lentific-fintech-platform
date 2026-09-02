/**
 * packages/loans : génération de l'échéancier une fois une offre acceptée.
 * Écoute "offer.accepted" plutôt que d'être appelé directement (règle §02).
 */
import { loansRepo } from "@fintech/database";
import { registerHandler, emit } from "@fintech/workflow";

export function createLoanFromOffer(offerId: string) {
  return loansRepo.createFromOffer(offerId);
}

export function attachSignedContract(loanId: string, contractId: string) {
  return loansRepo.attachContract(loanId, contractId);
}

/** Échéancier simple, mensualités constantes, à affiner avec le vrai moteur de risque. */
export function buildSchedule(amount: number, durationMonths: number, rate: number, startDate = new Date()) {
  const monthlyRate = rate / 12 / 100;
  const monthly = monthlyRate === 0 ? amount / durationMonths : (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -durationMonths));
  return Array.from({ length: durationMonths }, (_, i) => {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i + 1);
    return { dueDate, amount: Math.round(monthly * 100) / 100 };
  });
}

export async function generateSchedule(loanId: string, amount: number, durationMonths: number, rate: number) {
  const schedule = buildSchedule(amount, durationMonths, rate);
  await loansRepo.generateRepaymentSchedule(loanId, schedule);
  return schedule;
}

registerHandler("offer.accepted", async (payload) => {
  const { offerId, applicationId, amount, durationMonths, rate } = payload as {
    offerId: string;
    applicationId: string;
    amount: number;
    durationMonths: number;
    rate: number;
  };
  const loan = await createLoanFromOffer(offerId);
  await generateSchedule(loan.id, amount, durationMonths, rate);
  // §02 : le contrat (packages/contracts) attend que le prêt existe avant de
  // pouvoir être généré, c'est pourquoi il écoute "loan.created" et non
  // directement "offer.accepted" (l'ordre des handlers n'est pas garanti).
  await emit("loan.created", { loanId: loan.id, offerId, applicationId, amount, durationMonths, rate });
});
