import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { listQueueByStatus, reviewApplication, createOffer } from "@fintech/applications";
import { Card, StatusPill } from "@fintech/ui";

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

export default async function AdminDashboard() {
  const t = await getTranslations("CasesQueuePage");
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

      {all.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-soft">{t("empty")}</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {all.map((app) => (
            <Card key={app.id} accented={app.priority}>
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
