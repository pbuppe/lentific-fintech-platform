/**
 * packages/contracts, Contract Engine (§24) : génération de contrats depuis
 * des modèles versionnés. Réagit à "loan.created" (le prêt doit exister avant
 * de pouvoir générer son contrat) plutôt que d'être appelé directement
 * (règle §02). Une fois généré, le contrat est émis comme "contract.generated",
 * c'est packages/signatures qui prend le relais pour ouvrir le parcours de
 * signature manuelle (impression → signature → upload).
 *
 * Deux gabarits distincts (§ demande produit 2026-09-18) :
 *  - template.ts (renderContractPdf) : parcours marketplace standard,
 *    Lentific intermédiaire, financement potentiellement fractionné.
 *  - templateDirect.ts (renderDirectContractPdf) : prêt bilatéral direct
 *    entre un emprunteur et le prêteur particulier précis avec qui il a été
 *    mis en relation, dans deux cas : (1) formalisation volontaire après une
 *    mise en relation payée (generateDirectLoanContract), ou (2) un prêt
 *    marketplace qui se trouve financé par un seul investisseur, où un agent
 *    peut choisir de régénérer le contrat standard en version bilatérale
 *    (regenerateAsBilateralContract).
 */
import {
  contractsRepo,
  loansRepo,
  applicationsRepo,
  usersRepo,
  fundingRepo,
  directLoanAgreementsRepo,
} from "@fintech/database";
import { uploadRaw, getFileUrl } from "@fintech/documents";
import { registerHandler, emit } from "@fintech/workflow";
import { renderContractPdf } from "./template";
import { renderDirectContractPdf } from "./templateDirect";

const CURRENT_TEMPLATE_VERSION = "v1.0";
const DIRECT_TEMPLATE_VERSION = "direct-v1.0";

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
    locale: borrower.preferredLocale,
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

/**
 * Trigger 1 (§ demande produit 2026-09-18) : formalise en contrat bilatéral
 * un prêt convenu directement entre les deux parties d'une mise en relation
 * déjà payée. N'a rien à voir avec le parcours marketplace (pas de scoring,
 * pas de financement fractionné) : volontairement indépendant d'Application/
 * Offer/Loan.
 */
export async function generateDirectLoanContract(directLoanAgreementId: string) {
  const agreement = await directLoanAgreementsRepo.findById(directLoanAgreementId);
  if (!agreement) throw new Error("Accord de prêt direct introuvable.");

  const { borrower, lender } = agreement;
  const reference = `DIRECT-${agreement.introductionRequestId.slice(-8).toUpperCase()}`;

  const pdfBytes = await renderDirectContractPdf({
    reference,
    borrowerName: borrower.name ?? borrower.email,
    borrowerEmail: borrower.email,
    lenderName: lender.name ?? lender.email,
    lenderEmail: lender.email,
    amount: Number(agreement.amount),
    durationMonths: agreement.durationMonths,
    rate: Number(agreement.rate),
    generatedAt: new Date(),
    locale: borrower.preferredLocale,
  });

  const { storageKey } = await uploadRaw(`contrat-direct-${reference}-${DIRECT_TEMPLATE_VERSION}.pdf`, pdfBytes);
  return directLoanAgreementsRepo.attachContract(agreement.id, storageKey);
}

/**
 * Trigger 2 (§ demande produit 2026-09-18) : un prêt marketplace qui se
 * trouve financé par un seul investisseur peut être régénéré en contrat
 * bilatéral nommant cet investisseur, à la place du contrat standard
 * multi-prêteurs. Refuse si le prêt compte 0 ou plusieurs investisseurs (le
 * contrat standard reste alors le seul pertinent).
 */
export async function regenerateAsBilateralContract(loanId: string) {
  const loan = await loansRepo.findById(loanId);
  if (!loan) throw new Error("Prêt introuvable.");
  if (!loan.fundingOpportunity) throw new Error("Ce prêt n'a pas encore d'opportunité de financement ouverte.");
  if (!loan.contractId) throw new Error("Ce prêt n'a pas encore de contrat à régénérer.");

  const investments = await fundingRepo.listInvestmentsForOpportunity(loan.fundingOpportunity.id);
  if (investments.length !== 1) {
    throw new Error(
      investments.length === 0
        ? "Aucun investisseur n'a encore financé ce prêt."
        : "Ce prêt est financé par plusieurs investisseurs : le contrat bilatéral ne s'applique qu'à un financement par une seule personne."
    );
  }
  const lender = investments[0].investor;

  const application = await applicationsRepo.findById(loan.offer.applicationId);
  if (!application) throw new Error("Demande introuvable.");
  const borrower = await usersRepo.findById(application.borrowerId);
  if (!borrower) throw new Error("Emprunteur introuvable.");

  const pdfBytes = await renderDirectContractPdf({
    reference: application.reference,
    borrowerName: borrower.name ?? borrower.email,
    borrowerEmail: borrower.email,
    lenderName: lender.name ?? lender.email,
    lenderEmail: lender.email,
    amount: Number(loan.offer.amount),
    durationMonths: loan.offer.durationMonths,
    rate: Number(loan.offer.rate),
    generatedAt: new Date(),
    locale: borrower.preferredLocale,
  });

  const { storageKey } = await uploadRaw(`contrat-direct-${application.reference}-${DIRECT_TEMPLATE_VERSION}.pdf`, pdfBytes);
  return contractsRepo.updateStorageKey(loan.contractId, storageKey, DIRECT_TEMPLATE_VERSION);
}

registerHandler("loan.created", async (payload) => {
  const { loanId, applicationId } = payload as { loanId: string; applicationId: string };
  const contract = await generateContract(loanId);
  await emit("contract.generated", { contractId: contract.id, loanId, applicationId });
});
