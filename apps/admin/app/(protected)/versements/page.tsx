import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@fintech/database";
import {
  listFundingCases,
  listFundingAudit,
  declareDisbursement,
  confirmDisbursement,
  rejectDisbursementProof,
  markFundsAvailable,
  requestBrokerFee,
  cancelBrokerFee,
  DisbursementError,
  DISBURSEMENT_DECLARER_ROLES,
} from "@fintech/applications";
import { uploadRaw, getFileUrl } from "@fintech/documents";
import { Card, StatusPill } from "@fintech/ui";
import { getCurrentUser } from "../../../lib/session";

/**
 * Versement des fonds et honoraires (demande produit 2026-11-14, maquette
 * SODIVA CREDITS « Validation du crédit et des fonds »). Double validation :
 * un admin déclare, un super admin différent confirme ; les honoraires ne se
 * débloquent qu'après la confirmation.
 */

const MAX_PROOF_BYTES = 10 * 1024 * 1024;

async function requireStaff() {
  const user = await getCurrentUser();
  if (!user || !DISBURSEMENT_DECLARER_ROLES.includes(user.role)) redirect("/");
  return user;
}

async function run(fn: () => Promise<unknown>, done: string, anchor: string) {
  try {
    await fn();
  } catch (error) {
    if (error instanceof DisbursementError) redirect(`/versements?error=${error.message}#${anchor}`);
    throw error;
  }
  revalidatePath("/versements");
  redirect(`/versements?done=${done}#${anchor}`);
}

async function declareAction(formData: FormData) {
  "use server";
  const actor = await requireStaff();
  const applicationId = formData.get("applicationId") as string;
  const file = formData.get("proof") as File | null;
  if (!file || file.size === 0 || file.size > MAX_PROOF_BYTES) redirect(`/versements?error=proof_missing#${applicationId}`);
  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(-80) || "preuve.pdf";
  const { storageKey } = await uploadRaw(safeName, Buffer.from(await file.arrayBuffer()));
  await run(
    () =>
      declareDisbursement(actor, {
        applicationId,
        beneficiary: formData.get("beneficiary") as string,
        availability: formData.get("availability") as string,
        fundsDate: new Date(formData.get("fundsDate") as string),
        lenderReference: (formData.get("lenderReference") as string) ?? "",
        proofStorageKey: storageKey,
        proofFileName: safeName,
      }),
    "declared",
    applicationId
  );
}

async function confirmAction(formData: FormData) {
  "use server";
  const actor = await requireStaff();
  const applicationId = formData.get("applicationId") as string;
  await run(() => confirmDisbursement(actor, applicationId), "confirmed", applicationId);
}

async function rejectAction(formData: FormData) {
  "use server";
  const actor = await requireStaff();
  const applicationId = formData.get("applicationId") as string;
  await run(
    () => rejectDisbursementProof(actor, applicationId, (formData.get("reason") as string) ?? ""),
    "rejected",
    applicationId
  );
}

async function availableAction(formData: FormData) {
  "use server";
  const actor = await requireStaff();
  const applicationId = formData.get("applicationId") as string;
  await run(() => markFundsAvailable(actor, applicationId), "available", applicationId);
}

async function feeAction(formData: FormData) {
  "use server";
  const actor = await requireStaff();
  const applicationId = formData.get("applicationId") as string;
  await run(
    () =>
      requestBrokerFee(actor, {
        applicationId,
        kind: formData.get("kind") as string,
        amount: Number(String(formData.get("amount")).replace(",", ".")),
        dueDate: new Date(formData.get("dueDate") as string),
      }),
    "fee_requested",
    applicationId
  );
}

async function cancelFeeAction(formData: FormData) {
  "use server";
  const actor = await requireStaff();
  const applicationId = formData.get("applicationId") as string;
  await run(() => cancelBrokerFee(actor, formData.get("feeId") as string), "fee_cancelled", applicationId);
}

const inputClass = "rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink";
const labelClass = "grid min-w-0 gap-1 text-xs font-semibold text-ink-soft";
const fieldClass = `${inputClass} w-full min-w-0`;

export default async function FundsPage({ searchParams }: { searchParams: { error?: string; done?: string } }) {
  const me = await requireStaff();
  const t = await getTranslations("FundsPage");
  const locale = await getLocale();
  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const dateTimeFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const money = (value: number | string, currency = "EUR") =>
    new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(value));

  const cases = await listFundingCases();

  // Noms des personnes qui ont déclaré / confirmé, pour l'affichage.
  const staffIds = new Set<string>();
  for (const c of cases) {
    if (c.disbursement?.declaredById) staffIds.add(c.disbursement.declaredById);
    if (c.disbursement?.confirmedById) staffIds.add(c.disbursement.confirmedById);
  }
  const staff = await prisma.user.findMany({ where: { id: { in: [...staffIds] } }, select: { id: true, name: true, email: true } });
  const staffName = (id?: string | null) => {
    const s = staff.find((u) => u.id === id);
    return s ? s.name ?? s.email : "—";
  };

  const details = await Promise.all(
    cases.map(async (c) => ({
      audit: await listFundingAudit(c.id),
      proofUrl: c.disbursement ? await getFileUrl(c.disbursement.proofStorageKey) : null,
    }))
  );

  const today = new Date().toISOString().slice(0, 10);
  const inThirtyDays = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const knownErrors = ["not_allowed", "not_signed", "already_declared", "invalid_input", "not_declared", "same_person", "reason_required", "not_confirmed", "fees_locked", "not_pending", "proof_missing"];
  const knownDone = ["declared", "confirmed", "rejected", "available", "fee_requested", "fee_cancelled"];

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("kicker")}</p>
      <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-xl text-sm text-ink-soft">{t("description")}</p>

      {searchParams.error && knownErrors.includes(searchParams.error) && (
        <p role="alert" className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">
          {t(`errors.${searchParams.error}`)}
        </p>
      )}
      {searchParams.done && knownDone.includes(searchParams.done) && (
        <p role="status" className="mt-4 rounded-lg bg-success-soft px-3 py-2 text-sm text-success">
          {t(`done.${searchParams.done}`)}
        </p>
      )}

      {cases.length === 0 && (
        <Card className="mt-6">
          <p className="text-sm text-ink-soft">{t("empty")}</p>
        </Card>
      )}

      <div className="mt-6 grid gap-6">
        {cases.map((c, index) => {
          const d = c.disbursement;
          const offer = c.offers[0];
          const currency = c.currency.code;
          const { audit, proofUrl } = details[index];
          const confirmed = d?.status === "CONFIRMED";
          const declared = d?.status === "DECLARED";
          const canDeclare = c.status === "CONTRACT_SIGNED" && (!d || d.status === "REJECTED");
          const iDeclared = d?.declaredById === me.id;
          const canConfirm = declared && me.role === "SUPER_ADMIN" && !iDeclared;
          const pendingFees = c.brokerFees.filter((f) => f.status === "PENDING");

          const steps: Array<{ label: string; sub: string; on: boolean }> = [
            { label: t("steps.granted"), sub: t("steps.grantedSub"), on: true },
            { label: t("steps.declared"), sub: declared ? t("steps.declaredWaiting") : t("steps.declaredSub"), on: !!d && d.status !== "REJECTED" },
            { label: t("steps.confirmed"), sub: t("steps.confirmedSub"), on: confirmed },
            { label: t("steps.available"), sub: confirmed && d?.availability !== "AVAILABLE" ? t(`availability.${d!.availability}`) : t("steps.availableSub"), on: confirmed && d?.availability === "AVAILABLE" },
            { label: t("steps.fees"), sub: t("steps.feesSub"), on: confirmed },
          ];

          const statusPill = confirmed
            ? { tone: "ok" as const, label: t("status.confirmed") }
            : declared
              ? { tone: "pending" as const, label: t("status.declared") }
              : d?.status === "REJECTED"
                ? { tone: "risk" as const, label: t("status.rejected") }
                : { tone: "pending" as const, label: t("status.toDeclare") };

          return (
            <section key={c.id} id={c.id} className="scroll-mt-6">
              <Card accented={canConfirm || canDeclare}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs text-ink-faint">{c.reference}</p>
                    <p className="font-display text-lg text-ink">{c.borrower.name ?? c.borrower.email}</p>
                    <p className="text-xs text-ink-faint">{c.borrower.email}</p>
                  </div>
                  <StatusPill tone={statusPill.tone}>{statusPill.label}</StatusPill>
                </div>

                <ol className="mt-4 grid grid-cols-5 gap-2">
                  {steps.map((s) => (
                    <li key={s.label}>
                      <div className={`h-1.5 rounded-full ${s.on ? "bg-brand" : "bg-line"}`} />
                      <p className={`mt-1.5 text-xs font-semibold ${s.on ? "text-ink" : "text-ink-faint"}`}>{s.label}</p>
                      <p className="text-[11px] text-ink-faint">{s.sub}</p>
                    </li>
                  ))}
                </ol>

                {/* 1 · Crédit accordé */}
                <div className="mt-5 rounded-lg bg-surface-alt p-3 text-sm">
                  <p className="font-semibold text-ink">{t("section1")}</p>
                  <p className="mt-1 text-ink-soft">
                    {offer
                      ? t("grantedSummary", {
                          amount: money(offer.amount.toString(), currency),
                          rate: Number(offer.rate),
                          months: offer.durationMonths,
                        })
                      : t("grantedSummary", { amount: money(c.amount.toString(), currency), rate: "—", months: c.durationMonths })}
                  </p>
                </div>

                {/* 2 · Versement */}
                <div className="mt-4">
                  <p className="font-display text-base font-semibold text-ink">{t("section2")}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">{t("doubleValidationNote")}</p>

                  {d?.status === "REJECTED" && (
                    <p className="mt-3 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">
                      {t("proofRejected", { reason: d.rejectionReason ?? "" })}
                    </p>
                  )}

                  {canDeclare && (
                    <form action={declareAction} className="mt-3 grid gap-3 rounded-lg border border-line p-4">
                      <input type="hidden" name="applicationId" value={c.id} />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className={labelClass}>
                          {t("beneficiaryLabel")}
                          <select name="beneficiary" required className={fieldClass} defaultValue="BORROWER">
                            {(["BORROWER", "NOTARY", "SUPPLIERS"] as const).map((b) => (
                              <option key={b} value={b}>{t(`beneficiary.${b}`)}</option>
                            ))}
                          </select>
                        </label>
                        <label className={labelClass}>
                          {t("availabilityLabel")}
                          <select name="availability" required className={fieldClass} defaultValue="BANK_CHECKS">
                            {(["AVAILABLE", "BANK_CHECKS", "NOTARY_CHECKS"] as const).map((a) => (
                              <option key={a} value={a}>{t(`availability.${a}`)}</option>
                            ))}
                          </select>
                        </label>
                        <label className={labelClass}>
                          {t("fundsDateLabel")}
                          <input type="date" name="fundsDate" required max={today} defaultValue={today} className={fieldClass} />
                        </label>
                        <label className={labelClass}>
                          {t("lenderReferenceLabel")}
                          <input type="text" name="lenderReference" required minLength={2} maxLength={60} className={fieldClass} />
                        </label>
                      </div>
                      <label className={labelClass}>
                        {t("proofLabel")}
                        <input type="file" name="proof" required accept=".pdf,.jpg,.jpeg,.png" className="text-xs" />
                        <span className="font-normal text-ink-faint">{t("proofHint")}</span>
                      </label>
                      <button className="justify-self-start rounded-lg bg-yellow px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-ink">
                        {t("declare")}
                      </button>
                    </form>
                  )}

                  {d && d.status !== "REJECTED" && (
                    <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                      <dt className="text-ink-faint">{t("beneficiaryLabel")}</dt>
                      <dd className="text-ink">{t(`beneficiary.${d.beneficiary}`)}</dd>
                      <dt className="text-ink-faint">{t("availabilityLabel")}</dt>
                      <dd className="text-ink">{t(`availability.${d.availability}`)}</dd>
                      <dt className="text-ink-faint">{t("fundsDateLabel")}</dt>
                      <dd className="text-ink">{dateFmt.format(d.fundsDate)}</dd>
                      <dt className="text-ink-faint">{t("lenderReferenceLabel")}</dt>
                      <dd className="text-ink">{d.lenderReference}</dd>
                      <dt className="text-ink-faint">{t("proofLabel")}</dt>
                      <dd>
                        {proofUrl && (
                          <a href={proofUrl} target="_blank" rel="noreferrer" className="text-brand-ink underline">
                            {d.proofFileName}
                          </a>
                        )}
                      </dd>
                      <dt className="text-ink-faint">{t("declaredBy")}</dt>
                      <dd className="text-ink">{staffName(d.declaredById)} · {dateTimeFmt.format(d.declaredAt)}</dd>
                      {confirmed && d.confirmedAt && (
                        <>
                          <dt className="text-ink-faint">{t("confirmedBy")}</dt>
                          <dd className="text-ink">{staffName(d.confirmedById)} · {dateTimeFmt.format(d.confirmedAt)}</dd>
                        </>
                      )}
                    </dl>
                  )}

                  {declared && (
                    <div className="mt-3">
                      {canConfirm ? (
                        <div className="flex flex-wrap items-start gap-3">
                          <form action={confirmAction}>
                            <input type="hidden" name="applicationId" value={c.id} />
                            <button className="rounded-lg bg-yellow px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-ink">
                              {t("confirm")}
                            </button>
                          </form>
                          <details className="min-w-[260px] flex-1">
                            <summary className="inline-block cursor-pointer rounded-lg border border-line px-4 py-2 text-sm font-semibold text-accent">
                              {t("rejectProof")}
                            </summary>
                            <form action={rejectAction} className="mt-3 grid gap-2">
                              <input type="hidden" name="applicationId" value={c.id} />
                              <label className={labelClass}>
                                {t("reasonLabel")}
                                <textarea name="reason" required minLength={3} rows={2} className={fieldClass} placeholder={t("reasonPlaceholder")} />
                              </label>
                              <button className="justify-self-start rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
                                {t("confirmReject")}
                              </button>
                            </form>
                          </details>
                        </div>
                      ) : (
                        <p className="rounded-lg bg-surface-alt px-3 py-2 text-sm text-ink-soft">
                          {iDeclared && me.role === "SUPER_ADMIN" ? t("waitingOtherSuperAdmin") : t("waitingSuperAdmin")}
                        </p>
                      )}
                    </div>
                  )}

                  {confirmed && d && d.availability !== "AVAILABLE" && (
                    <form action={availableAction} className="mt-3">
                      <input type="hidden" name="applicationId" value={c.id} />
                      <button className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-brand">
                        {d.availability === "NOTARY_CHECKS" ? t("markAvailableNotary") : t("markAvailableBank")}
                      </button>
                    </form>
                  )}
                </div>

                {/* 3 · Honoraires */}
                <div className="mt-6 border-t border-line pt-4">
                  <p className="font-display text-base font-semibold text-ink">{t("section3")}</p>
                  {!confirmed ? (
                    <p className="mt-2 rounded-lg bg-surface-alt px-3 py-2 text-sm text-ink-soft">{t("feesLocked")}</p>
                  ) : (
                    <>
                      <p className="mt-0.5 text-xs text-ink-faint">{t("feesUnlocked")}</p>
                      <form action={feeAction} className="mt-3 flex flex-wrap items-end gap-3">
                        <input type="hidden" name="applicationId" value={c.id} />
                        <label className={labelClass}>
                          {t("feeKindLabel")}
                          <select name="kind" className={inputClass} defaultValue="BROKER_FEE">
                            <option value="BROKER_FEE">{t("feeKind.BROKER_FEE")}</option>
                            <option value="COMPLEMENT">{t("feeKind.COMPLEMENT")}</option>
                          </select>
                        </label>
                        <label className={labelClass}>
                          {t("feeAmountLabel", { currency })}
                          <input type="number" name="amount" required min={1} max={100000} step="0.01" className={`${inputClass} w-32`} />
                        </label>
                        <label className={labelClass}>
                          {t("feeDueLabel")}
                          <input type="date" name="dueDate" required min={today} defaultValue={inThirtyDays} className={inputClass} />
                        </label>
                        <button className="rounded-lg bg-yellow px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-ink">
                          {t("requestFee")}
                        </button>
                      </form>
                      <p className="mt-2 text-xs text-ink-faint">{t("feePaymentNote")}</p>
                    </>
                  )}

                  {c.brokerFees.length > 0 && (
                    <ul className="mt-3 grid gap-2">
                      {c.brokerFees.map((fee) => (
                        <li key={fee.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-alt px-3 py-2 text-sm">
                          <span>
                            <span className="font-semibold text-ink">{t(`feeKind.${fee.kind}`)} · {money(fee.amount.toString(), currency)}</span>
                            <span className="text-ink-faint"> · {t("feeDue", { date: dateFmt.format(fee.dueDate) })}</span>
                          </span>
                          <span className="flex items-center gap-2">
                            <StatusPill tone={fee.status === "PAID" ? "ok" : fee.status === "CANCELLED" ? "risk" : "pending"}>
                              {t(`feeStatus.${fee.status}`)}
                            </StatusPill>
                            {fee.status === "PENDING" && (
                              <form action={cancelFeeAction}>
                                <input type="hidden" name="applicationId" value={c.id} />
                                <input type="hidden" name="feeId" value={fee.id} />
                                <button className="text-xs text-ink-faint underline hover:text-accent">{t("cancelFee")}</button>
                              </form>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {pendingFees.length === 0 && confirmed && c.brokerFees.length === 0 && (
                    <p className="mt-2 text-xs text-ink-faint">{t("noFeesYet")}</p>
                  )}
                </div>

                {/* Journal */}
                {audit.length > 0 && (
                  <details className="mt-5 border-t border-line pt-3">
                    <summary className="cursor-pointer text-sm font-semibold text-ink">{t("auditTitle", { count: audit.length })}</summary>
                    <ul className="mt-2 grid gap-1">
                      {audit.map((entry) => (
                        <li key={entry.id} className="text-xs text-ink-soft">
                          <span className="font-semibold text-ink">{t.has(`audit.${entry.action}`) ? t(`audit.${entry.action}`) : entry.action}</span>
                          {" · "}
                          {entry.user?.name ?? entry.user?.email ?? "—"}
                          {" · "}
                          {dateTimeFmt.format(entry.createdAt)}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </Card>
            </section>
          );
        })}
      </div>
    </div>
  );
}
