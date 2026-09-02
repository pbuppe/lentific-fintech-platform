/**
 * packages/contracts, Contract Engine (§24) : génération de contrats depuis
 * des modèles versionnés. Réagit à "loan.created" (le prêt doit exister avant
 * de pouvoir générer son contrat) plutôt que d'être appelé directement
 * (règle §02). Une fois généré, le contrat est émis comme "contract.generated",
 * c'est packages/signatures qui prend le relais pour ouvrir le parcours de
 * signature manuelle (impression → signature → upload).
 */
import { contractsRepo, loansRepo, applicationsRepo, usersRepo } from "@fintech/database";
import { uploadRaw, getFileUrl } from "@fintech/documents";
import { registerHandler, emit } from "@fintech/workflow";
import { renderContractPdf } from "./template";

const CURRENT_TEMPLATE_VERSION = "v1.0";

export async function generateContract(loanId: string) {
  const loan = await loansRepo.findById(loanId);
  if (!loan) throw new Error("Prêt introuvable.");

  const application = await applicationsRepo.findById(loan.offer.applicationId);
  if (!application) throw new Error("Demande introuvable.");

  const borrower = await usersRepo.findById(application.borrowerId);
  if (!borrower) throw new Error("Emprunteur introuvable.");

  const pdfBytes = await renderContractPdf({
    reference: application.reference,
    borrowerName: borrower.name ?? borrower.email,
    borrowerEmail: borrower.email,
    amount: Number(loan.offer.amount),
    durationMonths: loan.offer.durationMonths,
    rate: Number(loan.offer.rate),
    generatedAt: new Date(),
  });

  const { storageKey } = await uploadRaw(`contrat-${application.reference}-${CURRENT_TEMPLATE_VERSION}.pdf`, pdfBytes);

  const contract = await contractsRepo.create({ loanId, templateVersion: CURRENT_TEMPLATE_VERSION, storageKey });

  // Le prêt doit pouvoir retrouver son contrat (utilisé par l'espace emprunteur
  // pour construire le formulaire d'upload de la signature), sans ce lien
  // retour, loan.contractId reste vide alors que le contrat existe bien.
  await loansRepo.attachContract(loanId, contract.id);
  return contract;
}

export function getContractDownloadUrl(storageKey: string) {
  return getFileUrl(storageKey);
}

registerHandler("loan.created", async (payload) => {
  const { loanId, applicationId } = payload as { loanId: string; applicationId: string };
  const contract = await generateContract(loanId);
  await emit("contract.generated", { contractId: contract.id, loanId, applicationId });
});
