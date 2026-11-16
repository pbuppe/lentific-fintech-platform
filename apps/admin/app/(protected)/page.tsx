import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations, getLocale } from "next-intl/server";
import { listQueueByStatus, reviewApplication, createOffer } from "@fintech/applications";
import { generateBrokerMandate, latestBrokerMandates } from "@fintech/contracts";
import { sendClientNoticeEmail } from "@fintech/auth";
import { getFileUrl } from "@fintech/documents";
import { Card, StatusPill } from "@fintech/ui";
import { getCurrentUser } from "../../lib/session";

const QUEUE_STATUSES = ["SUBMITTED", "KYC_PENDING", "KYC_VERIFIED", "UNDER_REVIEW"] as const;

async function reviewAction(formData: FormData) {
  "use server";
  const applicationId = formData.get("applicationId") as string;
  await reviewApplication(applicationId, "agent-demo");
  revalidatePath("/");
}

async function createOfferAction(formData: FormData) {
  "use server";
  const applicationId = formData.get("applicationId") as string;
  await createOffer(
    applicationId,
    {
      amount: Number(formData.get("amount")),
      durationMonths: Number(formData.get("durationMonths")),
      rate: Number(formData.get("rate")),
    },
    "agent-demo"
  );
  revalidatePath("/");
}

/**
 * Mandat de recherche de financement (demande produit 2026-11-16) : le
 * conseiller fixe les honoraires du dossier, le mandat PDF est généré dans la
 * langue du client, rangé dans son espace avec une demande de signature, et
 * un e-mail l'invite à le signer.
 */
async function mandateAction(formData: FormData) {
  "use server";
  const staff = await getCurrentUser();
  if (!staff || !["ADMIN", "SUPER_ADMIN"].includes(staff.role)) redirect("/");
  const applicationId = formData.get("applicationId") as string;
  const fee = Number(String(formData.get("fee") ?? "").replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(fee) || fee <= 0 || fee > 100000) redirect(`/?mandate=error#${applicationId}`);
  const { borrower } = await generateBrokerMandate({ applicationId, fee, actorId: staff.id });
  await sendClientNoticeEmail(borrower, "document", staff.name ?? staff.email);
  revalidatePath("/");
  redirect(`/?mandate=done#${applicationId}`);
}

export default async function AdminDashboard({ searchParams }: { searchParams: { mandate?: string } }) {
  const t = await getTranslations("CasesQueuePage");
  const locale = await getLocale();
  const STATUS_LABEL: Record<string, string> = {
    SUBMITTED: t("status.submitted"),
    KYC_PENDING: t("status.kycPending"),
    KYC_VERIFIED: t("status.kycVerified"),
    UNDER_REVIEW: t("status.underReview"),
  };
  const queues = await Promise.all(QUEUE_STATUSES.map((status) => listQueueByStatus(status).catch(() => [])));
  const all = queues.flat().sort((a, b) => {
    if (a.priority !== b.priority) return a.priority ? -1 : 1;
    if (a.priority && b.priority && a.slaDeadline && b.slaDeadline) {
      return a.slaDeadline.getTime() - b.slaDeadline.getTime();
    }
    return 0;
  });

  const mandates = await latestBrokerMandates(all.map((a) => a.id)).catch(() => new Map());
  const mandateUrls = new Map<string, string>();
  for (const [id, m] of mandates) if (m.storageKey) mandateUrls.set(id, await getFileUrl(m.storageKey));
  const fmtMoney = (value: number, currency: string) =>
    new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(value);

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("kicker")}</p>
          <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
            {t("title")}
          </h1>
        </div>
        <span className="rounded-full bg-brand px-3.5 py-1.5 text-xs font-semibold text-white">
          {t("pendingCount", { count: all.length })}
        </span>
      </div>

      {searchParams.mandate === "done" && (
        <p role="status" className="mb-4 rounded-lg bg-success-soft px-3 py-2 text-sm text-success">{t("mandateDone")}</p>
      )}
      {searchParams.mandate === "error" && (
        <p role="alert" className="mb-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">{t("mandateError")}</p>
      )}

      {all.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-soft">{t("empty")}</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {all.map((app) => (
            <Card key={app.id} accented={app.priority} className="scroll-mt-6" id={app.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs text-ink-faint">
                    {app.priority && <span className="mr-1 text-yellow-ink">★</span>}
                    {app.reference}
                  </p>
                  <p className="mt-0.5 font-display text-base text-ink">
                    {t("amountDuration", { amount: Number(app.amount).toLocaleString("fr-FR"), months: app.durationMonths })}
                  </p>
                  {app.score != null && <p className="mt-0.5 text-xs text-ink-faint">{t("score", { score: app.score })}</p>}
                  {app.priority && app.slaDeadline && (
                    <p className={`mt-0.5 text-xs font-semibold ${app.slaBreachedAt ? "text-accent" : "text-yellow-ink"}`}>
                      {app.slaBreachedAt
                        ? t("slaBreached")
                        : t("priorityDeadline", { date: app.slaDeadline.toLocaleString("fr-FR") })}
                    </p>
                  )}
                </div>
                <StatusPill tone={app.status === "KYC_PENDING" ? "risk" : "pending"}>
                  {STATUS_LABEL[app.status] ?? app.status}
                </StatusPill>
              </div>

              {app.status === "KYC_VERIFIED" && (
                <form action={reviewAction} className="mt-3">
                  <input type="hidden" name="applicationId" value={app.id} />
                  <button className="rounded-lg bg-yellow px-3.5 py-2 text-xs font-semibold text-ink hover:bg-yellow-ink">
                    {t("startAnalysis")}
                  </button>
                </form>
              )}

              {app.status === "UNDER_REVIEW" && (
                <form action={createOfferAction} className="mt-3 flex flex-wrap items-end gap-2 rounded-lg bg-surface-alt p-3">
                  <label className="grid gap-1 text-xs text-ink-soft">
                    {t("amountLabel")}
                    <input
                      type="number"
                      name="amount"
                      required
                      defaultValue={Number(app.amount)}
                      className="w-28 rounded-md border border-line px-2 py-1.5 text-sm text-ink"
                    />
                  </label>
                  <label className="grid gap-1 text-xs text-ink-soft">
                    {t("durationLabel")}
                    <input
                      type="number"
                      name="durationMonths"
                      required
                      defaultValue={app.durationMonths}
                      className="w-24 rounded-md border border-line px-2 py-1.5 text-sm text-ink"
                    />
                  </label>
                  <label className="grid gap-1 text-xs text-ink-soft">
                    {t("rateLabel")}
                    <input
                      type="number"
                      name="rate"
                      step="0.1"
                      required
                      defaultValue={5.9}
                      className="w-20 rounded-md border border-line px-2 py-1.5 text-sm text-ink"
                    />
                  </label>
                  <input type="hidden" name="applicationId" value={app.id} />
                  <button className="rounded-lg bg-yellow px-3.5 py-2 text-xs font-semibold text-ink hover:bg-yellow-ink">
                    {t("createOffer")}
                  </button>
                </form>
              )}

              {(() => {
                const m = mandates.get(app.id);
                return (
                  <div className="mt-3 rounded-lg border border-line p-3">
                    <p className="text-xs font-semibold text-ink">{t("mandateTitle")}</p>
                    {m ? (
                      <p className="mt-1 text-xs text-ink-soft">
                        {t("mandateSent", { date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(m.generatedAt), amount: fmtMoney(m.fee, m.currency) })}
                        {mandateUrls.has(app.id) && (
                          <>
                            {" · "}
                            <a href={mandateUrls.get(app.id)} target="_blank" rel="noreferrer" className="text-brand-ink underline">
                              {t("mandateView")}
                            </a>
                          </>
                        )}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-ink-faint">{t("mandateHint")}</p>
                    )}
                    <form action={mandateAction} className="mt-2 flex flex-wrap items-end gap-2">
                      <input type="hidden" name="applicationId" value={app.id} />
                      <label className="grid gap-1 text-xs text-ink-soft">
                        {t("mandateFeeLabel")}
                        <input
                          type="number"
                          name="fee"
                          min="1"
                          step="0.01"
                          required
                          defaultValue={m ? m.fee : undefined}
                          className="w-28 rounded-md border border-line px-2 py-1.5 text-sm text-ink"
                        />
                      </label>
                      <button className="rounded-lg border border-line px-3.5 py-2 text-xs font-semibold text-ink hover:bg-surface-alt">
                        {m ? t("mandateRegenerate") : t("mandateGenerate")}
                      </button>
                    </form>
                  </div>
                );
              })()}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
