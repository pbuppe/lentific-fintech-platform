/**
 * packages/signatures : signature MANUELLE.
 *
 * Décision produit (pas de fournisseur de signature électronique pour
 * l'instant) : une fois le contrat généré, le client doit l'imprimer, le
 * signer à la main, puis en uploader une version scannée/photographiée dans
 * son espace. Un agent vérifie la pièce et confirme depuis le back-office,
 * c'est cette confirmation, et non l'upload lui-même, qui fait passer le
 * contrat au statut définitif "signed".
 *
 * Pour automatiser plus tard (fournisseur externe type Yousign/DocuSign) :
 * remplacer `submitSignedContract` + `confirmSignature` par l'appel au
 * prestataire, sans changer les événements émis.
 */
import { signaturesRepo, contractsRepo, loansRepo } from "@fintech/database";
import { uploadDocument } from "@fintech/documents";
import { emit, registerHandler } from "@fintech/workflow";

/** Crée l'entrée "en attente d'upload" dès que le contrat existe. */
export function requestSignature(contractId: string) {
  return signaturesRepo.create({ contractId, provider: "manual_upload" });
}

/** Retrouve la signature en attente pour un contrat (utile pour l'écran d'upload côté client). */
export function getSignatureForContract(contractId: string) {
  return signaturesRepo.findByContract(contractId);
}

/** Le client uploade la version signée à la main (photo ou scan). */
export async function submitSignedContract(input: {
  signatureId: string;
  contractId: string;
  ownerId: string;
  applicationId: string;
  fileName: string;
  content: Buffer | Uint8Array;
}) {
  const document = await uploadDocument({
    ownerId: input.ownerId,
    applicationId: input.applicationId,
    type: "signed_contract",
    fileName: input.fileName,
    content: input.content,
  });

  await emit("signature.uploaded", {
    signatureId: input.signatureId,
    contractId: input.contractId,
    documentId: document.id,
    ownerId: input.ownerId,
  });

  return document;
}

/** Un agent a vérifié la pièce uploadée et confirme que le contrat est bien signé. */
export async function confirmSignature(signatureId: string, contractId: string, agentId: string) {
  await signaturesRepo.setStatus(signatureId, "SIGNED", new Date());

  // Retrouve le dossier concerné (contrat → prêt → offre → demande) pour que
  // packages/applications puisse faire avancer son statut (règle §02 : par
  // événement, pas par appel direct).
  const contract = await contractsRepo.findById(contractId);
  const loan = contract ? await loansRepo.findById(contract.loanId) : null;
  const applicationId = loan?.offer.applicationId;

  await emit("contract.signed", {
    contractId,
    status: "signed",
    confirmedBy: agentId,
    applicationId,
    loanId: contract?.loanId,
  });
}

/** Un agent rejette la pièce uploadée (signature manquante, page illisible, etc.). */
export async function rejectSignature(signatureId: string, agentId: string, reason: string) {
  await signaturesRepo.setStatus(signatureId, "DECLINED");
  await emit("signature.rejected", { signatureId, agentId, reason });
}

// Dès que packages/contracts a généré le contrat, on ouvre l'entrée "en attente
// d'upload", le client n'a plus qu'à imprimer, signer et déposer le fichier.
registerHandler("contract.generated", async (payload) => {
  const { contractId } = payload as { contractId: string };
  await requestSignature(contractId);
});
