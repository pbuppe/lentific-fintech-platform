import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { pageViewsRepo, type StatsRange } from "@fintech/database";
import { Card } from "@fintech/ui";
import { getCurrentUser } from "../../../lib/session";
import { AutoRefresh } from "../../components/AutoRefresh";
import { TimeRangeFilter } from "../../components/TimeRangeFilter";

/**
 * Onglet Statistiques (§ demande produit 2026-09-18), réservé admin/super
 * admin. Suivi de visite basique auto-hébergé, PAS Matomo : un vrai Matomo
 * suppose un compte Matomo Cloud (nouveau service externe, paiement à
 * valider par l'utilisateur) ou un hébergement PHP+MySQL séparé (possible
 * sur l'hébergement Hostinger déjà utilisé pour le domaine, mais hors de ce
 * pipeline Next.js/Vercel), ni l'un ni l'autre ne peut être mis en place
 * sans une décision/action de l'utilisateur. Reprend néanmoins les mêmes
 * repères qu'un tableau de bord Matomo classique : visiteurs en direct,
 * filtre de période, répartition géographique réelle (détection Vercel, pas
 * la langue choisie). Voir apps/web/app/components/PageViewTracker.tsx pour
 * la collecte.
 */
const VALID_RANGES: StatsRange[] = ["24h", "7d", "30d", "1y"];

export default async function StatisticsPage({ searchParams }: { searchParams: { range?: string } }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) redirect("/");
  const t = await getTranslations("StatisticsPage");

  const range: StatsRange = VALID_RANGES.includes(searchParams.range as StatsRange) ? (searchParams.range as StatsRange) : "7d";
  const since = pageViewsRepo.rangeToSince(range);
  const sinceToday = new Date();
  sinceToday.setHours(0, 0, 0, 0);

  const [rightNow, activeNow, visitorsToday, views, visitors, series, topPaths, byLocale, byGeoCountry] = await Promise.all([
    pageViewsRepo.countActiveVisitors(2),
    pageViewsRepo.countActiveVisitors(30),
    pageViewsRepo.countUniqueVisitorsSince(sinceToday),
    pageViewsRepo.countSince(since),
    pageViewsRepo.countUniqueVisitorsSince(since),
    pageViewsRepo.countTimeSeries(range),
    pageViewsRepo.topPaths(since, 10),
    pageViewsRepo.countByLocale(since),
    pageViewsRepo.countByGeoCountry(since),
  ]);

  const maxSeries = Math.max(1, ...series.map((s) => s.views));
  const hasGeoData = byGeoCountry.some((c) => c.countryCode !== "?");

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <AutoRefresh intervalSeconds={20} />
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("kicker")}</p>
      <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-2xl text-sm text-ink-soft">{t("description")}</p>

      {/* Temps réel : indépendant du filtre de période ci-dessous */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="border-success/30 bg-success/5">
          <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-success">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            {t("rightNow")}
          </p>
          <p className="mt-1 font-display text-3xl font-semibold text-success">{rightNow}</p>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("activeNow")}</p>
          <p className="mt-1 font-display text-3xl font-semibold text-brand-ink">{activeNow}</p>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("todayVisitors")}</p>
          <p className="mt-1 font-display text-3xl font-semibold text-brand-ink">{visitorsToday}</p>
        </Card>
      </div>

      {/* Filtre de période : gouverne tout ce qui suit */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-ink">{t("periodTitle")}</h2>
        <TimeRangeFilter current={range} t={t} />
      </div>

      <Card className="mt-4">
        <div className="flex items-baseline gap-3">
          <p className="font-display text-2xl font-semibold text-brand-ink">{visitors}</p>
          <p className="text-xs text-ink-faint">{t("pageViewsCount", { count: views })}</p>
        </div>
      </Card>

      <Card className="mt-4">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("dailyChart")}</p>
        <div className="mt-3 flex h-32 items-end gap-0.5">
          {series.map((s) => (
            <div key={s.key} className="group relative flex-1">
              <div
                className="rounded-t bg-brand transition-colors group-hover:bg-accent"
                style={{ height: `${Math.max(2, (s.views / maxSeries) * 100)}%` }}
              />
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 text-[10px] text-white group-hover:block">
                {s.key} · {t("dailyTooltip", { views: s.views, visitors: s.visitors })}
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
        <p className="mt-0.5 text-xs text-ink-faint">{t("byCountryHint")}</p>
        {byGeoCountry.length === 0 || !hasGeoData ? (
          <p className="mt-2 text-sm text-ink-soft">{t("noGeoData")}</p>
        ) : (
          <ul className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {byGeoCountry.map((c) => (
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
