import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma, subscriptionsRepo } from "@fintech/database";
import { listOpportunities, invest } from "@fintech/funding";
import { requestAndPayIntroduction, listSentBy, INTRODUCTION_FEE } from "@fintech/introductions";
import { listMyDocumentRequests } from "@fintech/documents";
import { Card, StatusPill } from "@fintech/ui";
import { getCurrentUser } from "../../../../lib/session";

async function investAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const t = await getTranslations("InvestorDashboard");

  const opportunityId = formData.get("opportunityId") as string;
  const amount = Number(formData.get("amount"));
  if (!amount || amount <= 0) {
    redirect(`/investor/dashboard?error=${encodeURIComponent(t("invalidAmount"))}`);
  }

  await invest(opportunityId, user.id, amount);
  revalidatePath("/investor/dashboard");
  revalidatePath("/investor/portfolio");
}

async function requestIntroductionAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const targetUserId = formData.get("targetUserId") as string;
  const targetId = formData.get("applicationId") as string;
  const eur = await prisma.currency.findUniqueOrThrow({ where: { code: "EUR" } });

  await requestAndPayIntroduction({
    requesterId: user.id,
    targetUserId,
    targetType: "APPLICATION",
    targetId,
    currencyId: eur.id,
  });
  revalidatePath("/investor/dashboard");
}

export default async function InvestorDashboard({ searchParams }: { searchParams: { error?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const t = await getTranslations("InvestorDashboard");
  const RISK_LABEL: Record<string, string> = t.raw("riskLabel");

  const [opportunities, sentIntroductions, documentRequests, subscription] = await Promise.all([
    listOpportunities().catch(() => []),
    listSentBy(user.id).catch(() => []),
    listMyDocumentRequests(user.id).catch(() => []),
    subscriptionsRepo.findForUser(user.id),
  ]);
  const paidApplicationIds = new Set(
    sentIntroductions.filter((r) => r.status === "PAID" && r.targetType === "APPLICATION").map((r) => r.targetId)
  );
  const isPremium = subscription?.status === "ACTIVE";
  const pendingDocumentRequests = documentRequests.filter((r) => r.status === "PENDING");

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">apps/web · (investor)</p>
        <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-xl text-xs text-ink-faint">
          {t("intro")}
        </p>
      </div>

      {pendingDocumentRequests.length > 0 && (
        <a
          href="/investor/documents"
          className="mb-4 flex items-center justify-between rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent hover:opacity-90"
        >
          <span>
            <span className="font-semibold">
              {t("pendingDocumentsCount", { count: pendingDocumentRequests.length })}
            </span>{" "}
            {t("pendingDocumentsRequested", {
              count: pendingDocumentRequests.length,
              labels: pendingDocumentRequests.map((r) => r.label).join(", "),
            })}
          </span>
          <span className="whitespace-nowrap font-semibold underline">{t("send")}</span>
        </a>
      )}

      {searchParams.error && (
        <p className="mb-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">{searchParams.error}</p>
      )}

      {opportunities.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-soft">
            {t("noOpportunities")}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {opportunities.map((opp) => {
            const funded = Number(opp.fundedAmount);
            const target = Number(opp.targetAmount);
            const pct = target > 0 ? Math.round((funded / target) * 100) : 0;
            const remaining = Math.max(0, target - funded);
            const fullyFunded = remaining <= 0;
            const application = opp.loan.offer.application;
            const alreadyIntroduced = paidApplicationIds.has(application.id);
            return (
              <Card key={opp.id}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-lg text-ink">{application.purpose}</h3>
                  <StatusPill tone={opp.riskLevel === "high" ? "risk" : opp.riskLevel === "low" ? "ok" : "pending"}>
                    {t("riskPill", { risk: RISK_LABEL[opp.riskLevel] ?? opp.riskLevel })}
                  </StatusPill>
                </div>
                <p className="mt-0.5 text-xs text-ink-faint">{t("fileReference", { reference: application.reference })}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-alt">
                  <span className="block h-full rounded-full bg-brand" style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
                <p className="mt-2 text-sm text-ink-soft">
                  {t("fundedProgress", { funded: funded.toLocaleString("fr-FR"), target: target.toLocaleString("fr-FR"), pct })}
                </p>

                {fullyFunded ? (
                  <p className="mt-3 text-xs text-success">{t("fullyFunded")}</p>
                ) : (
                  <form action={investAction} className="mt-3 flex items-center gap-2">
                    <input type="hidden" name="opportunityId" value={opp.id} />
                    <input
                      type="number"
                      name="amount"
                      min={50}
                      max={remaining}
                      step={50}
                      placeholder={t("maxAmountPlaceholder", { remaining: remaining.toLocaleString("fr-FR") })}
                      required
                      className="w-40 rounded-lg border border-line px-3 py-1.5 text-sm text-ink"
                    />
                    <button className="rounded-lg bg-yellow px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-yellow-ink">
                      {t("invest")}
                    </button>
                  </form>
                )}

                <div className="mt-3 border-t border-line pt-3">
                  {alreadyIntroduced ? (
                    <p className="text-xs text-success">
                      {t("introductionPaidPrefix")}{" "}
                      <a href="/investor/mises-en-relation" className="underline">
                        {t("introductionPaidLink")}
                      </a>
                      .
                    </p>
                  ) : (
                    <form action={requestIntroductionAction} className="flex items-center gap-2">
                      <input type="hidden" name="targetUserId" value={application.borrowerId} />
                      <input type="hidden" name="applicationId" value={application.id} />
                      <button className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-brand hover:text-brand-ink">
                        {t("requestIntroduction", { premium: isPremium ? "yes" : "no", fee: INTRODUCTION_FEE })}
                      </button>
                    </form>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
