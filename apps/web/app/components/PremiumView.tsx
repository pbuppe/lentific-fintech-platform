import { getTranslations, getLocale } from "next-intl/server";
import { prisma, subscriptionsRepo } from "@fintech/database";
import { isPaypalConfigured, paypalMode, refreshPremiumIfStale } from "@fintech/payments";
import { commercialPrices } from "../../lib/price";
import { Card, StatusPill } from "@fintech/ui";
import { subscribePremiumAction, cancelPremiumAction } from "../../lib/actions/premium";

const NOTICE_TONE: Record<string, string> = {
  active: "bg-success-soft text-success",
  deferred: "bg-success-soft text-success",
  cancelled: "bg-surface-alt text-ink-soft",
  checkout_cancelled: "bg-surface-alt text-ink-soft",
  failed: "bg-accent-soft text-accent",
  unavailable: "bg-accent-soft text-accent",
  cancel_failed: "bg-accent-soft text-accent",
};

/** Page « Abonnement Premium », commune aux espaces emprunteur et investisseur. */
export async function PremiumView({ userId, audience, notice: rawNotice }: { userId: string; audience: "borrower" | "investor"; notice?: string }) {
  const t = await getTranslations("Premium");
  const locale = await getLocale();
  const day = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
  const money = (v: number | string, c: string) => new Intl.NumberFormat(locale, { style: "currency", currency: c }).format(Number(v));
  const { amount, fee } = await commercialPrices(); // déjà formatés : « 44,90 € », « 14,90 € »

  // Relit l'état chez PayPal (renouvellement, échec, résiliation depuis PayPal) si besoin.
  const subscription = (await refreshPremiumIfStale(userId)) ?? (await subscriptionsRepo.findForUser(userId));
  const paypal = isPaypalConfigured();
  const isActive = subscription?.status === "ACTIVE";
  const willRenew = isActive && !subscription?.cancelledAt;
  const pastDue = subscription?.status === "PAST_DUE";
  const viaPaypal = subscription?.provider === "paypal";
  const STATUS_LABEL = t.raw("statusLabels") as Record<string, string>;
  const features = t.raw(`${audience}.features`) as string[];

  const charges = await prisma.payment.findMany({
    where: { userId, type: "subscription", status: { in: ["COMPLETED", "REFUNDED"] } },
    include: { currency: { select: { code: true } } },
    orderBy: { createdAt: "desc" },
    take: 12,
  });
  const notice = rawNotice && NOTICE_TONE[rawNotice] ? rawNotice : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t(`${audience}.kicker`)}</p>
      <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
        {t("title")}
      </h1>

      {notice && (
        <p role={NOTICE_TONE[notice].includes("accent") ? "alert" : "status"} className={`mt-5 rounded-lg px-4 py-3 text-sm ${NOTICE_TONE[notice]}`}>
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

      {/* Argumentaire */}
      <section className="mt-6 overflow-hidden rounded-2xl bg-brand text-white">
        <div className="p-6">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/75">{t("eyebrow")}</p>
          <h2 className="mt-1 font-display text-2xl font-semibold leading-tight">{t(`${audience}.headline`)}</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/90">{t(`${audience}.pitch`)}</p>
        </div>
        <div className="grid gap-px bg-white/15 sm:grid-cols-2">
          <div className="bg-brand-ink/40 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">{t("unitLabel")}</p>
            <p className="mt-1 font-display text-xl font-semibold">{t("unitPrice", { fee })}</p>
            <p className="mt-1 text-xs text-white/75">{t("unitNote")}</p>
          </div>
          <div className="bg-white p-5 text-ink">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">{t("premiumLabel")}</p>
            <p className="mt-1 font-display text-xl font-semibold text-brand-ink">
              {t("premiumPrice", { amount })}
            </p>
            <p className="mt-1 text-xs text-ink-soft">{t("breakEven", { fee, amount })}</p>
          </div>
        </div>
      </section>

      <Card className="mt-6">
        <p className="font-display text-sm font-semibold text-ink">{t("featuresHeading")}</p>
        <ul className="mt-3 grid gap-2 text-sm text-ink-soft">
          {features.map((f) => (
            <li key={f} className="flex gap-2">
              <span aria-hidden className="mt-0.5 text-success">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5">
          {willRenew ? (
            <form action={cancelPremiumAction}>
              <button className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink-soft hover:bg-surface-alt">
                {t("cancelButton")}
              </button>
              <p className="mt-2 text-xs text-ink-faint">{t("cancelHint", { date: day.format(subscription!.currentPeriodEnd) })}</p>
            </form>
          ) : (
            <form action={subscribePremiumAction}>
              <button className="w-full rounded-lg bg-yellow px-5 py-3 text-sm font-semibold text-ink hover:bg-yellow-ink sm:w-auto">
                {paypal
                  ? isActive
                    ? t("reactivatePaypal")
                    : subscription
                      ? t("resubscribePaypal", { amount })
                      : t("subscribePaypal", { amount })
                  : isActive
                    ? t("reactivateButton")
                    : t("subscribeButton", { amount })}
              </button>
              <p className="mt-2 text-xs text-ink-faint">
                {paypal ? (isActive ? t("reactivateHint", { date: day.format(subscription!.currentPeriodEnd) }) : t("paypalHint")) : t("noCommitment")}
                {paypal && paypalMode() === "sandbox" && <span className="ml-1 rounded bg-sand px-1.5 py-0.5 font-semibold text-sand-ink">{t("sandbox")}</span>}
              </p>
            </form>
          )}
        </div>
        {audience === "borrower" && <p className="mt-4 text-xs text-ink-faint">{t("borrower.disclaimer")}</p>}
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
