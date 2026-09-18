import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { pageViewsRepo } from "@fintech/database";
import { Card } from "@fintech/ui";
import { getCurrentUser } from "../../../lib/session";
import { AutoRefresh } from "../../components/AutoRefresh";

/**
 * Onglet Statistiques (§ demande produit 2026-09-18), réservé admin/super
 * admin. Suivi de visite basique auto-hébergé, PAS Matomo : un vrai Matomo
 * suppose un compte Matomo Cloud (nouveau service externe, paiement à
 * valider par l'utilisateur) ou un hébergement PHP+MySQL séparé (possible
 * sur l'hébergement Hostinger déjà utilisé pour le domaine, mais hors de ce
 * pipeline Next.js/Vercel), ni l'un ni l'autre ne peut être mis en place
 * sans une décision/action de l'utilisateur. Voir apps/web/app/components/PageViewTracker.tsx
 * pour la collecte.
 */
export default async function StatisticsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) redirect("/");
  const t = await getTranslations("StatisticsPage");

  const since7 = new Date();
  since7.setDate(since7.getDate() - 7);
  const since30 = new Date();
  since30.setDate(since30.getDate() - 30);
  const sinceToday = new Date();
  sinceToday.setHours(0, 0, 0, 0);

  const [activeNow, views7, visitors7, views30, visitors30, visitorsToday, daily, topPaths, byLocale, byCountry] = await Promise.all([
    pageViewsRepo.countActiveVisitors(30),
    pageViewsRepo.countSince(since7),
    pageViewsRepo.countUniqueVisitorsSince(since7),
    pageViewsRepo.countSince(since30),
    pageViewsRepo.countUniqueVisitorsSince(since30),
    pageViewsRepo.countUniqueVisitorsSince(sinceToday),
    pageViewsRepo.countByDay(30),
    pageViewsRepo.topPaths(since30, 10),
    pageViewsRepo.countByLocale(since30),
    pageViewsRepo.countByCountry(since30),
  ]);

  const maxDaily = Math.max(1, ...daily.map((d) => d.views));

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <AutoRefresh intervalSeconds={30} />
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("kicker")}</p>
      <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-2xl text-sm text-ink-soft">{t("description")}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="border-success/30 bg-success/5">
          <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-success">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            {t("activeNow")}
          </p>
          <p className="mt-1 font-display text-3xl font-semibold text-success">{activeNow}</p>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("todayVisitors")}</p>
          <p className="mt-1 font-display text-3xl font-semibold text-brand-ink">{visitorsToday}</p>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("last7days")}</p>
          <p className="mt-1 font-display text-3xl font-semibold text-brand-ink">{visitors7}</p>
          <p className="mt-0.5 text-xs text-ink-faint">{t("pageViewsCount", { count: views7 })}</p>
        </Card>
      </div>

      <Card className="mt-4">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("last30days")}</p>
        <div className="mt-1 flex items-baseline gap-3">
          <p className="font-display text-2xl font-semibold text-brand-ink">{visitors30}</p>
          <p className="text-xs text-ink-faint">{t("pageViewsCount", { count: views30 })}</p>
        </div>
      </Card>

      <Card className="mt-4">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("dailyChart")}</p>
        <div className="mt-3 flex h-32 items-end gap-0.5">
          {daily.map((d) => (
            <div key={d.date} className="group relative flex-1">
              <div
                className="rounded-t bg-brand transition-colors group-hover:bg-accent"
                style={{ height: `${Math.max(2, (d.views / maxDaily) * 100)}%` }}
              />
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 text-[10px] text-white group-hover:block">
                {d.date} · {t("dailyTooltip", { views: d.views, visitors: d.visitors })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("topPages")}</p>
          {topPaths.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">{t("noData")}</p>
          ) : (
            <ul className="mt-2 grid gap-1.5">
              {topPaths.map((p) => (
                <li key={p.path} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-ink-soft">{p.path}</span>
                  <span className="shrink-0 font-mono text-xs text-ink-faint">{p.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("byLanguage")}</p>
          {byLocale.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">{t("noData")}</p>
          ) : (
            <ul className="mt-2 grid gap-1.5">
              {byLocale.map((l) => (
                <li key={l.locale} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-ink-soft">{l.locale.toUpperCase()}</span>
                  <span className="font-mono text-xs text-ink-faint">{l.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("byCountry")}</p>
        {byCountry.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">{t("noData")}</p>
        ) : (
          <ul className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {byCountry.map((c) => (
              <li key={c.countryCode} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-ink-soft">{c.countryCode.toUpperCase()}</span>
                <span className="font-mono text-xs text-ink-faint">{c.count}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
