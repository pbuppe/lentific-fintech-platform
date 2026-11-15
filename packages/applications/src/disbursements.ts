/**
 * Versement des fonds et honoraires de courtage (demande produit 2026-11-14,
 * reprise de la maquette Lentific « Validation du crédit et des fonds »).
 *
 * Règles :
 *  - le versement ne peut être déclaré que sur un dossier au contrat signé ;
 *  - double validation : un ADMIN ou SUPER_ADMIN déclare avec une preuve,
 *    puis un SUPER_ADMIN DIFFÉRENT confirme (on ne valide pas sa propre
 *    déclaration) ; la confirmation passe le dossier en DISBURSED ;
 *  - aucun honoraire ne peut être demandé avant la confirmation du versement
 *    (un courtier ne peut rien encaisser avant l'obtention du prêt).
 */
import {
  applicationsRepo,
  auditLogsRepo,
  disbursementsRepo,
  type FundsAvailability,
  type FundsBeneficiary,
  type Role,
} from "@fintech/database";
import { emit } from "@fintech/workflow";

export class DisbursementError extends Error {}

type Actor = { id: string; role: Role };

export const DISBURSEMENT_DECLARER_ROLES: Role[] = ["ADMIN", "SUPER_ADMIN"];
export const DISBURSEMENT_CONFIRMER_ROLES: Role[] = ["SUPER_ADMIN"];
export const BROKER_FEE_KINDS = ["BROKER_FEE", "COMPLEMENT"] as const;

const BENEFICIARIES: FundsBeneficiary[] = ["BORROWER", "NOTARY", "SUPPLIERS"];
const AVAILABILITIES: FundsAvailability[] = ["AVAILABLE", "BANK_CHECKS", "NOTARY_CHECKS"];

function audit(actor: Actor, applicationId: string, action: string, after?: object) {
  return auditLogsRepo.create({ userId: actor.id, action, entity: `Application:${applicationId}`, after });
}

export function listFundingCases() {
  return disbursementsRepo.listFundingCases();
}

export function countDisbursementsAwaitingConfirmation() {
  return disbursementsRepo.countDeclared();
}

export function listFundingAudit(applicationId: string) {
  return disbursementsRepo.listAuditForApplication(applicationId);
}

export async function declareDisbursement(
  actor: Actor,
  input: {
    applicationId: string;
    beneficiary: string;
    availability: string;
    fundsDate: Date;
    lenderReference: string;
    proofStorageKey: string;
    proofFileName: string;
  }
) {
  if (!DISBURSEMENT_DECLARER_ROLES.includes(actor.role)) throw new DisbursementError("not_allowed");
  const application = await applicationsRepo.findById(input.applicationId);
  if (!application || application.status !== "CONTRACT_SIGNED") throw new DisbursementError("not_signed");

  const existing = await disbursementsRepo.findByApplication(input.applicationId);
  if (existing && existing.status !== "REJECTED") throw new DisbursementError("already_declared");

  if (!BENEFICIARIES.includes(input.beneficiary as FundsBeneficiary)) throw new DisbursementError("invalid_input");
  if (!AVAILABILITIES.includes(input.availability as FundsAvailability)) throw new DisbursementError("invalid_input");
  if (Number.isNaN(input.fundsDate.getTime())) throw new DisbursementError("invalid_input");
  const lenderReference = input.lenderReference.trim();
  if (lenderReference.length < 2) throw new DisbursementError("invalid_input");

  const declared = await disbursementsRepo.upsertDeclaration({
    applicationId: input.applicationId,
    beneficiary: input.beneficiary as FundsBeneficiary,
    availability: input.availability as FundsAvailability,
    fundsDate: input.fundsDate,
    lenderReference,
    proofStorageKey: input.proofStorageKey,
    proofFileName: input.proofFileName,
    declaredById: actor.id,
  });
  await audit(actor, input.applicationId, "disbursement.declared", { lenderReference, beneficiary: input.beneficiary });
  await emit("disbursement.declared", { applicationId: input.applicationId, borrowerId: application.borrowerId });
  return declared;
}

export async function confirmDisbursement(actor: Actor, applicationId: string) {
  if (!DISBURSEMENT_CONFIRMER_ROLES.includes(actor.role)) throw new DisbursementError("not_allowed");
  const disbursement = await disbursementsRepo.findByApplication(applicationId);
  if (!disbursement || disbursement.status !== "DECLARED") throw new DisbursementError("not_declared");
  if (disbursement.declaredById === actor.id) throw new DisbursementError("same_person");

  const application = await applicationsRepo.findById(applicationId);
  if (!application) throw new DisbursementError("not_signed");

  await disbursementsRepo.markConfirmed(applicationId, actor.id);
  await applicationsRepo.transitionStatus(applicationId, "DISBURSED", actor.id);
  await audit(actor, applicationId, "disbursement.confirmed");
  await emit("application.status_changed", { applicationId, toStatus: "DISBURSED" });
  await emit("disbursement.confirmed", { applicationId, borrowerId: application.borrowerId });
}

export async function rejectDisbursementProof(actor: Actor, applicationId: string, reason: string) {
  if (!DISBURSEMENT_CONFIRMER_ROLES.includes(actor.role)) throw new DisbursementError("not_allowed");
  const disbursement = await disbursementsRepo.findByApplication(applicationId);
  if (!disbursement || disbursement.status !== "DECLARED") throw new DisbursementError("not_declared");
  if (disbursement.declaredById === actor.id) throw new DisbursementError("same_person");
  const cleaned = reason.trim();
  if (cleaned.length < 3) throw new DisbursementError("reason_required");

  await disbursementsRepo.markRejected(applicationId, cleaned);
  await audit(actor, applicationId, "disbursement.proof_rejected", { reason: cleaned });
}

export async function markFundsAvailable(actor: Actor, applicationId: string) {
  if (!DISBURSEMENT_DECLARER_ROLES.includes(actor.role)) throw new DisbursementError("not_allowed");
  const disbursement = await disbursementsRepo.findByApplication(applicationId);
  if (!disbursement || disbursement.status !== "CONFIRMED") throw new DisbursementError("not_confirmed");
  if (disbursement.availability === "AVAILABLE") return;

  await disbursementsRepo.markAvailable(applicationId);
  const application = await applicationsRepo.findById(applicationId);
  await audit(actor, applicationId, "disbursement.funds_available");
  if (application) await emit("disbursement.funds_available", { applicationId, borrowerId: application.borrowerId });
}

export async function requestBrokerFee(
  actor: Actor,
  input: { applicationId: string; kind: string; amount: number; dueDate: Date }
) {
  if (!DISBURSEMENT_DECLARER_ROLES.includes(actor.role)) throw new DisbursementError("not_allowed");
  const disbursement = await disbursementsRepo.findByApplication(input.applicationId);
  // Garde-fou légal : jamais d'honoraires avant le versement confirmé.
  if (!disbursement || disbursement.status !== "CONFIRMED") throw new DisbursementError("fees_locked");
  if (!(BROKER_FEE_KINDS as readonly string[]).includes(input.kind)) throw new DisbursementError("invalid_input");
  if (!Number.isFinite(input.amount) || input.amount <= 0 || input.amount > 100000) throw new DisbursementError("invalid_input");
  if (Number.isNaN(input.dueDate.getTime())) throw new DisbursementError("invalid_input");

  const application = await applicationsRepo.findById(input.applicationId);
  if (!application) throw new DisbursementError("not_confirmed");

  const fee = await disbursementsRepo.createFeeRequest({
    applicationId: input.applicationId,
    userId: application.borrowerId,
    kind: input.kind,
    amount: Math.round(input.amount * 100) / 100,
    dueDate: input.dueDate,
    createdById: actor.id,
  });
  await audit(actor, input.applicationId, "broker_fee.requested", { amount: fee.amount.toString(), kind: input.kind });
  await emit("broker_fee.requested", {
    applicationId: input.applicationId,
    borrowerId: application.borrowerId,
    feeId: fee.id,
    requestedById: actor.id,
  });
  return fee;
}

export async function cancelBrokerFee(actor: Actor, feeId: string) {
  if (!DISBURSEMENT_DECLARER_ROLES.includes(actor.role)) throw new DisbursementError("not_allowed");
  const fee = await disbursementsRepo.findFeeRequest(feeId);
  if (!fee || fee.status !== "PENDING") throw new DisbursementError("not_pending");
  await disbursementsRepo.cancelFeeRequest(feeId);
  await audit(actor, fee.applicationId, "broker_fee.cancelled", { feeId });
}

/** Côté emprunteur : vérifie que la demande lui appartient et est payable. */
export async function getPayableBrokerFee(feeId: string, userId: string) {
  const fee = await disbursementsRepo.findFeeRequest(feeId);
  if (!fee || fee.userId !== userId || fee.status !== "PENDING") throw new DisbursementError("not_pending");
  return fee;
}

export async function markBrokerFeePaid(feeId: string, userId: string, paymentId: string) {
  const fee = await getPayableBrokerFee(feeId, userId);
  await disbursementsRepo.markFeePaid(feeId, paymentId);
  await auditLogsRepo.create({
    userId,
    action: "broker_fee.paid",
    entity: `Application:${fee.applicationId}`,
    after: { feeId, paymentId },
  });
}

export function listMyBrokerFees(userId: string) {
  return disbursementsRepo.listFeesForUser(userId);
}

export function getDisbursementForApplication(applicationId: string) {
  return disbursementsRepo.findByApplication(applicationId);
}
