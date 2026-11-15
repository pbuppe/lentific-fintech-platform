import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma, subscriptionsRepo } from "@fintech/database";
import {
  subscribe,
  cancelSubscription,
  isPaypalConfigured,
  paypalMode,
  startPremiumCheckout,
  cancelPremium,
  refreshPremiumIfStale,
  PremiumError,
  PREMIUM_TIER,
  PREMIUM_MONTHLY_AMOUNT,
} from "@fintech/payments";
import { webBaseUrl } from "@fintech/auth";
import { Card, StatusPill } from "@fintech/ui";
import { getCurrentUser } from "../../../../lib/session";
import { PAYPAL_LOCALES } from "../../../../lib/paypalCheckout";

async function subscribeAction() {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const eur = await prisma.currency.findUniqueOrThrow({ where: { code: "EUR" } });

  if (!isPaypalConfigured()) {
    await subscribe(user.id, PREMIUM_TIER, PREMIUM_MONTHLY_AMOUNT, eur.id);
    revalidatePath("/investor", "layout");
    redirect("/investor/premium?premium=active");
  }

  let url: string;
  try {
    const base = webBaseUrl();
    url = await startPremiumCheckout({
      userId: user.id,
      currencyId: eur.id,
      currencyCode: eur.code,
      returnUrl: `${base}/paiement/paypal/abonnement/retour`,
      cancelUrl: `${base}/paiement/paypal/abonnement/annule`,
      locale: PAYPAL_LOCALES[await getLocale()],
    });
  } catch (error) {
    if (error instanceof PremiumError) redirect("/investor/premium");
    console.error("[paypal] impossible de démarrer l'abonnement", error);
    redirect("/investor/premium?premium=unavailable");
  }
  redirect(url);
}

async function cancelAction() {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  try {
    const sub = await subscriptionsRepo.findForUser(user.id);
    if (sub?.provider === "paypal") await cancelPremium(user.id);
    else await cancelSubscription(user.id);
  } catch (error) {
    console.error("[paypal] résiliation impossible", error);
    redirect("/investor/premium?premium=cancel_failed");
  }
  revalidatePath("/investor", "layout");
  redirect("/investor/premium?premium=cancelled");
}

const NOTICE_TONE: Record<string, string> = {
  active: "bg-success-soft text-success",
  deferred: "bg-success-soft text-success",
  cancelled: "bg-surface-alt text-ink-soft",
  checkout_cancelled: "bg-surface-alt text-ink-soft",
  failed: "bg-accent-soft text-accent",
  unavailable: "bg-accent-soft text-accent",
  cancel_failed: "bg-accent-soft text-accent",
};

export default async function InvestorPremiumPage({ searchParams }: { searchParams: { premium?: string } }) {
  const t = await getTranslations("InvestorPremium");
  const STATUS_LABEL: Record<string, string> = t.raw("statusLabels");
  const locale = await getLocale();
  const day = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
  const money = (v: number | string, c: string) => new Intl.NumberFormat(locale, { style: "currency", currency: c }).format(Number(v));

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Relit l'état chez PayPal (renouvellement, échec, résiliation depuis PayPal) si besoin.
  const subscription = (await refreshPremiumIfStale(user.id)) ?? (await subscriptionsRepo.findForUser(user.id));
  const paypal = isPaypalConfigured();
  const isActive = subscription?.status === "ACTIVE";
  const willRenew = isActive && !subscription?.cancelledAt;
  const pastDue = subscription?.status === "PAST_DUE";
  const viaPaypal = subscription?.provider === "paypal";

  const charges = await prisma.payment.findMany({
    where: { userId: user.id, type: "subscription", status: { in: ["COMPLETED", "REFUNDED"] } },
    include: { currency: { select: { code: true } } },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  const notice = searchParams.premium && NOTICE_TONE[searchParams.premium] ? searchParams.premium : null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("kicker")}</p>
      <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
        {t("title")}
      </h1>
      <p className="mt-3 text-sm text-ink-soft">{paypal ? t("paypalPrice", { amount: PREMIUM_MONTHLY_AMOUNT }) : t("priceInfo", { amount: PREMIUM_MONTHLY_AMOUNT })}</p>

      {notice && (
        <p role={NOTICE_TONE[notice].includes("accent") ? "alert" : "status"} className={`mt-4 rounded-lg px-4 py-3 text-sm ${NOTICE_TONE[notice]}`}>
          {t(`notices.${notice}`, { date: subscription ? day.format(subscription.currentPeriodEnd) : "" })}
        </p>
      )}

      {subscription && (
        <div className="mt-5 rounded-xl border border-line bg-surface p-4">
          <StatusPill tone={isActive ? "ok" : pastDue ? "risk" : "pending"}>
            {isActive && subscription.cancelledAt ? t("statusEnding") : STATUS_LABEL[subscription.status] ?? subscription.status}
          </StatusPill>
          <p className="mt-2 text-sm text-ink-soft">
            {isActive
              ? willRenew
                ? viaPaypal
                  ? t("nextCharge", { date: day.format(subscription.currentPeriodEnd) })
                  : t("renewalAuto", { date: day.format(subscription.currentPeriodEnd) })
                : t("renewalCancelled", { date: day.format(subscription.currentPeriodEnd) })
              : pastDue
                ? t("pastDue")
                : t("ended", { date: day.format(subscription.currentPeriodEnd) })}
          </p>
          {isActive && !viaPaypal && paypal && <p className="mt-1 text-xs text-ink-faint">{t("legacyNote", { date: day.format(subscription.currentPeriodEnd) })}</p>}
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
          {willRenew ? (
            <form action={cancelAction}>
              <button className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink-soft hover:bg-surface-alt">
                {t("cancelButton")}
              </button>
              <p className="mt-2 text-xs text-ink-faint">{t("cancelHint", { date: day.format(subscription!.currentPeriodEnd) })}</p>
            </form>
          ) : (
            <form action={subscribeAction}>
              <button className="rounded-lg bg-yellow px-4 py-2.5 text-sm font-semibold text-white hover:bg-yellow-ink">
                {paypal
                  ? isActive
                    ? t("reactivatePaypal")
                    : pastDue || subscription
                      ? t("resubscribePaypal", { amount: PREMIUM_MONTHLY_AMOUNT })
                      : t("subscribePaypal", { amount: PREMIUM_MONTHLY_AMOUNT })
                  : isActive
                    ? t("reactivateButton")
                    : t("subscribeButton")}
              </button>
              {paypal && (
                <p className="mt-2 text-xs text-ink-faint">
                  {isActive ? t("reactivateHint", { date: day.format(subscription!.currentPeriodEnd) }) : t("paypalHint")}
                  {paypalMode() === "sandbox" && <span className="ml-1 rounded bg-sand px-1.5 py-0.5 font-semibold text-sand-ink">{t("sandbox")}</span>}
                </p>
              )}
            </form>
          )}
        </div>
      </Card>

      <h2 className="mt-8 font-display text-lg text-ink">{t("historyHeading")}</h2>
      {charges.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">{t("historyEmpty")}</p>
      ) : (
        <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
          {charges.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
              <span className="text-ink-soft">{day.format(c.capturedAt ?? c.createdAt)}</span>
              <span className="text-xs text-ink-faint">{c.provider === "paypal" ? "PayPal" : t("simulated")}</span>
              <span className="font-semibold text-ink">{money(c.amount.toString(), c.currency.code)}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
