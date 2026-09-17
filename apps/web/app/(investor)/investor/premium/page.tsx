import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma, subscriptionsRepo } from "@fintech/database";
import { subscribe, cancelSubscription } from "@fintech/payments";
import { Card, StatusPill } from "@fintech/ui";
import { getCurrentUser } from "../../../../lib/session";

const TIER = "INVESTOR_PREMIUM";
const MONTHLY_AMOUNT = 15;

async function subscribeAction() {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const eur = await prisma.currency.findUniqueOrThrow({ where: { code: "EUR" } });
  await subscribe(user.id, TIER, MONTHLY_AMOUNT, eur.id);
  revalidatePath("/investor/premium");
}

async function cancelAction() {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await cancelSubscription(user.id);
  revalidatePath("/investor/premium");
}

export default async function InvestorPremiumPage() {
  const t = await getTranslations("InvestorPremium");
  const STATUS_LABEL: Record<string, string> = t.raw("statusLabels");

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const subscription = await subscriptionsRepo.findForUser(user.id);
  const isActive = subscription?.status === "ACTIVE";
  const willRenew = isActive && !subscription?.cancelledAt;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">apps/web · (investor)</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{t("title")}</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {t("priceInfo", { amount: MONTHLY_AMOUNT })}
      </p>

      {subscription && (
        <div className="mt-4">
          <StatusPill tone={isActive ? "ok" : "pending"}>{STATUS_LABEL[subscription.status] ?? subscription.status}</StatusPill>
          {isActive && (
            <p className="mt-2 text-xs text-ink-faint">
              {willRenew
                ? t("renewalAuto", { date: subscription.currentPeriodEnd.toLocaleDateString("fr-FR") })
                : t("renewalCancelled", { date: subscription.currentPeriodEnd.toLocaleDateString("fr-FR") })}
            </p>
          )}
        </div>
      )}

      <Card className="mt-6">
        <p className="font-display text-sm font-semibold text-ink">{t("featuresHeading")}</p>
        <ul className="mt-3 grid gap-2 text-sm text-ink-soft">
          <li>{t("features.unlimited.prefix")} <strong className="text-ink">{t("features.unlimited.bold")}</strong>{t("features.unlimited.suffix")}</li>
          <li>{t("features.alert.prefix")} <strong className="text-ink">{t("features.alert.bold")}</strong>{t("features.alert.suffix")}</li>
          <li>{t("features.verification.prefix")} <strong className="text-ink">{t("features.verification.bold")}</strong>{t("features.verification.suffix")}</li>
          <li>{t("features.badge.prefix")} <strong className="text-ink">{t("features.badge.bold")}</strong>{t("features.badge.suffix")}</li>
          <li>{t("features.dashboard")}</li>
        </ul>

        <div className="mt-5">
          {isActive ? (
            willRenew ? (
              <form action={cancelAction}>
                <button className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink-soft hover:bg-surface-alt">
                  {t("cancelButton")}
                </button>
              </form>
            ) : (
              <form action={subscribeAction}>
                <button className="rounded-lg bg-yellow px-4 py-2.5 text-sm font-semibold text-ink hover:bg-yellow-ink">
                  {t("reactivateButton")}
                </button>
              </form>
            )
          ) : (
            <form action={subscribeAction}>
              <button className="rounded-lg bg-yellow px-4 py-2.5 text-sm font-semibold text-ink hover:bg-yellow-ink">
                {t("subscribeButton")}
              </button>
            </form>
          )}
        </div>
      </Card>
    </main>
  );
}
