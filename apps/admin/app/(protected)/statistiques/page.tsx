import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { pageViewsRepo, visitAnalyticsRepo, type StatsRange, type VisitSummary, type JourneyStep } from "@fintech/database";
import { Card } from "@fintech/ui";
import { getCurrentUser } from "../../../lib/session";
import { AutoRefresh } from "../../components/AutoRefresh";
import { Bars, DeviceIcon, EvolutionChart, Flag, VisitCard, deviceLabel, formatDuration, regionName, type T } from "./components";
import { VisitorsTable } from "./VisitorsTable";
import { TimeRangeFilter } from "../../components/TimeRangeFilter";

/**
 * Suivi des visiteurs façon Matomo, auto-hébergé (demandes produit 2026-09-18
 * puis 2026-11-15), pour les agents, admins et super admins :
 *  - Vue d'ensemble : courbes d'évolution, indicateurs clés, appareils,
 *    systèmes, navigateurs, pays (drapeaux), sources, pages et actions ;
 *  - En direct : chaque visiteur actif, rafraîchi toutes les 10 secondes ;
 *  - Parcours : chaque visite avec ses pages, le temps passé et ses actions.
 * Collecte : apps/web/app/components/PageViewTracker.tsx + api/track.
 */
const VALID_RANGES: StatsRange[] = ["24h", "7d", "30d", "1y"];
const STAFF = ["AGENT", "ADMIN", "SUPER_ADMIN"];
const PAGE_SIZE = 25;


type Search = { range?: string; tab?: string; device?: string; country?: string; page?: string; vcountry?: string; vaction?: string; vrows?: string };

export default async function StatisticsPage({ searchParams }: { searchParams: Search }) {
  const user = await getCurrentUser();
  if (!user || !STAFF.includes(user.role)) redirect("/");
  const t = await getTranslations("StatisticsPage");
  const locale = await getLocale();
  const tab = searchParams.tab === "live" ? "live" : searchParams.tab === "visits" ? "visits" : "overview";
  const range: StatsRange = VALID_RANGES.includes(searchParams.range as StatsRange) ? (searchParams.range as StatsRange) : "7d";

  const sinceToday = new Date();
  sinceToday.setHours(0, 0, 0, 0);
  const [rightNow, activeNow, visitorsToday] = await Promise.all([
    pageViewsRepo.countActiveVisitors(5),
    pageViewsRepo.countActiveVisitors(30),
    pageViewsRepo.countUniqueVisitorsSince(sinceToday),
  ]);

  const tabHref = (k: string) => `/statistiques?tab=${k}&range=${range}`;

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <AutoRefresh intervalSeconds={tab === "live" ? 10 : 30} />
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("kicker")}</p>
      <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-2xl text-sm text-ink-soft">{t("descriptionV2")}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <a href={tabHref("live")} className="block">
          <Card className="border-success/30 bg-success/5">
            <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-success">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              {t("rightNow5")}
            </p>
            <p className="mt-1 font-display text-3xl font-semibold text-success">{rightNow}</p>
          </Card>
        </a>
        <Card>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("activeNow")}</p>
          <p className="mt-1 font-display text-3xl font-semibold text-brand-ink">{activeNow}</p>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("todayVisitors")}</p>
          <p className="mt-1 font-display text-3xl font-semibold text-brand-ink">{visitorsToday}</p>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex gap-1 rounded-lg bg-surface-alt p-1">
          {(["overview", "live", "visits"] as const).map((k) => (
            <a key={k} href={tabHref(k)} className={`rounded-md px-3 py-1.5 text-sm font-semibold ${tab === k ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"}`}>
              {t(`tabs.${k}`)}
            </a>
          ))}
        </div>
        {tab !== "live" && <TimeRangeFilter current={range} t={t} extra={`&tab=${tab}`} />}
      </div>

      {tab === "overview" && <Overview t={t} locale={locale} range={range} searchParams={searchParams} />}
      {tab === "live" && <Live t={t} locale={locale} />}
      {tab === "visits" && <Visits t={t} locale={locale} range={range} searchParams={searchParams} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Onglets
// ---------------------------------------------------------------------------

async function Overview({ t, locale, range, searchParams }: { t: T; locale: string; range: StatsRange; searchParams: Search }) {
  const since = pageViewsRepo.rangeToSince(range);
  const unit = range === "24h" ? "hour" : range === "1y" ? "month" : "day";
  const [anonymousViews, kpis, views, series, visitsSeries, devices, oses, browsers, geo, origin, cities, referrers, entries, pages, events] = await Promise.all([
    visitAnalyticsRepo.anonymousViewsSince(since),
    visitAnalyticsRepo.visitKpis(since),
    pageViewsRepo.countSince(since),
    pageViewsRepo.countTimeSeries(range),
    visitAnalyticsRepo.visitsSeries(since, unit),
    visitAnalyticsRepo.breakdown(since, "device"),
    visitAnalyticsRepo.breakdown(since, "os"),
    visitAnalyticsRepo.breakdown(since, "browser"),
    visitAnalyticsRepo.breakdown(since, "geo", 15),
    visitAnalyticsRepo.breakdown(since, "origin", 15),
    visitAnalyticsRepo.breakdown(since, "city", 10),
    visitAnalyticsRepo.topReferrers(since),
    visitAnalyticsRepo.topEntryPages(since),
    visitAnalyticsRepo.topPagesWithTime(since),
    visitAnalyticsRepo.topEvents(since),
  ]);
  const keyOf = (d: Date) => (unit === "hour" ? d.toISOString().slice(0, 13) : unit === "month" ? d.toISOString().slice(0, 7) : d.toISOString().slice(0, 10));
  const visitsBy = new Map(visitsSeries.map((s) => [keyOf(s.bucket), s.visits]));
  const points = series.map((s) => ({ key: s.key, views: s.views, visitors: s.visitors, visits: visitsBy.get(s.key) ?? 0 }));
  const sum = (rows: { count: number }[]) => rows.reduce((a, r) => a + r.count, 0);
  const label = (k: string | null) => k ?? t("breakdown.unknown");

  const kpiItems = [
    { k: "visits", v: String(kpis.visits) },
    { k: "visitors", v: String(kpis.visitors) },
    { k: "pageViews", v: String(views) },
    { k: "pagesPerVisit", v: kpis.avgPages.toLocaleString(locale, { maximumFractionDigits: 1 }) },
    { k: "avgDuration", v: formatDuration(kpis.avgMs) },
    { k: "bounceRate", v: `${Math.round(kpis.bounceRate * 100)} %` },
    { k: "members", v: String(kpis.members) },
    { k: "anonymous", v: String(anonymousViews) },
  ];

  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpiItems.map((i) => (
          <Card key={i.k}>
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{t(`kpi.${i.k}` as "kpi.visits")}</p>
            <p className="mt-1 font-display text-xl font-semibold text-brand-ink">{i.v}</p>
          </Card>
        ))}
      </div>

      <EvolutionChart points={points} t={t} unit={unit} locale={locale} />

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Bars title={t("breakdown.devices")} t={t} locale={locale} total={sum(devices)} rows={devices.map((d) => ({ key: d.key, label: d.key ? t(`device.${d.key}` as "device.desktop") : t("breakdown.unknown"), count: d.count, icon: <DeviceIcon type={d.key} /> }))} />
        <Bars title={t("breakdown.os")} t={t} locale={locale} total={sum(oses)} rows={oses.map((d) => ({ key: d.key, label: label(d.key), count: d.count }))} />
        <Bars title={t("breakdown.browsers")} t={t} locale={locale} total={sum(browsers)} rows={browsers.map((d) => ({ key: d.key, label: label(d.key), count: d.count }))} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Bars title={t("breakdown.geo")} t={t} locale={locale} flags total={sum(geo)} rows={geo.map((d) => ({ key: d.key, label: regionName(locale, d.key) ?? t("breakdown.unknown"), count: d.count }))} />
        <Bars title={t("breakdown.origin")} t={t} locale={locale} flags total={sum(origin)} rows={origin.map((d) => ({ key: d.key, label: regionName(locale, d.key) ?? t("breakdown.unknown"), count: d.count }))} />
        <Bars title={t("breakdown.cities")} t={t} locale={locale} flags total={sum(cities)} rows={cities.map((d) => ({ key: d.key, flag: d.geo, label: label(d.key), count: d.count }))} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Bars title={t("breakdown.sources")} t={t} locale={locale} total={sum(referrers)} rows={referrers.map((d) => ({ key: d.host, label: d.host ?? t("visit.direct"), count: d.count }))} />
        <Bars title={t("breakdown.entryPages")} t={t} locale={locale} total={sum(entries)} rows={entries.map((d) => ({ key: d.path, label: d.path, count: d.count }))} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("topPages")}</p>
          {pages.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">{t("noData")}</p>
          ) : (
            <table className="mt-2 w-full text-sm">
              <thead className="text-xs text-ink-faint"><tr><th className="text-left font-normal" /><th className="text-right font-normal">{t("chart.views")}</th><th className="text-right font-normal">{t("breakdown.avgTime")}</th></tr></thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.path} className="border-t border-line">
                    <td className="max-w-[220px] truncate py-1 text-ink-soft">{p.path}</td>
                    <td className="py-1 text-right font-mono text-xs">{p.views}</td>
                    <td className="py-1 text-right font-mono text-xs">{p.avgMs != null ? formatDuration(p.avgMs) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("breakdown.actions")}</p>
          {events.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">{t("noData")}</p>
          ) : (
            <ul className="mt-2 grid gap-1.5">
              {events.map((e) => (
                <li key={`${e.kind}-${e.label}`} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent">{t(`event.${e.kind}` as "event.click")}</span>
                    <span className="truncate text-ink-soft">{e.label}</span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-ink-faint">{e.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <VisitorsTable t={t} locale={locale} since={since} range={range} params={searchParams} />
    </>
  );
}

async function Live({ t, locale }: { t: T; locale: string }) {
  const [visits, anonymous] = await Promise.all([visitAnalyticsRepo.liveVisits(5), visitAnalyticsRepo.anonymousLive(5)]);
  const paths = await visitAnalyticsRepo.journeys(visits.map((v) => v.sessionId));
  const clock = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return (
    <div className="mt-4 grid gap-3">
      <p className="text-sm text-ink-soft">{t("live.hint")}</p>
      {visits.length === 0 && anonymous.length === 0 ? (
        <Card><p className="text-sm text-ink-soft">{t("live.empty")}</p></Card>
      ) : (
        visits.map((v) => <VisitCard key={v.sessionId} v={v} t={t} locale={locale} journey={paths.get(v.sessionId)} live open />)
      )}
      {anonymous.length > 0 && (
        <Card>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("live.anonymousTitle")}</p>
          <p className="mt-0.5 text-xs text-ink-faint">{t("live.anonymousHint")}</p>
          <ul className="mt-3 grid gap-2">
            {anonymous.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-2 text-sm">
                <span className="font-mono text-xs text-ink-faint">{clock.format(a.createdAt)}</span>
                <span className="flex items-center gap-1.5 text-ink"><Flag code={a.geoCountryCode} locale={locale} />{regionName(locale, a.geoCountryCode) ?? t("visit.unknownCountry")}{a.city ? ` · ${a.city}` : ""}</span>
                <span className="flex items-center gap-1 text-ink-soft"><DeviceIcon type={a.deviceType} />{deviceLabel(t, a)}{a.browser ? ` · ${a.browser}` : ""}</span>
                <span className="font-semibold text-ink">{a.path}</span>
                {a.durationMs != null && <span className="text-xs text-ink-faint">{formatDuration(a.durationMs)}</span>}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

async function Visits({ t, locale, range, searchParams }: { t: T; locale: string; range: StatsRange; searchParams: Search }) {
  const since = pageViewsRepo.rangeToSince(range);
  const page = Math.max(1, Number(searchParams.page) || 1);
  const device = ["mobile", "tablet", "desktop"].includes(searchParams.device ?? "") ? searchParams.device : undefined;
  const country = /^[A-Z]{2}$/.test(searchParams.country ?? "") ? searchParams.country : undefined;
  const [visits, countries] = await Promise.all([
    visitAnalyticsRepo.recentVisits(since, { limit: PAGE_SIZE + 1, offset: (page - 1) * PAGE_SIZE, device, country }),
    visitAnalyticsRepo.breakdown(since, "geo", 30),
  ]);
  const hasNext = visits.length > PAGE_SIZE;
  const shown = visits.slice(0, PAGE_SIZE);
  const paths = await visitAnalyticsRepo.journeys(shown.map((v) => v.sessionId));
  const base = (p: Record<string, string | undefined>) => {
    const q = new URLSearchParams({ tab: "visits", range, ...(device ? { device } : {}), ...(country ? { country } : {}) });
    for (const [k, v] of Object.entries(p)) v ? q.set(k, v) : q.delete(k);
    return `/statistiques?${q.toString()}`;
  };
  const chip = (active: boolean) => `rounded-full px-3 py-1 text-xs font-semibold ${active ? "bg-brand text-white" : "border border-line text-ink-soft hover:bg-surface-alt"}`;

  return (
    <div className="mt-4 grid gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-semibold text-ink-soft">{t("visits.filterDevice")} :</span>
        <a href={base({ device: undefined, page: undefined })} className={chip(!device)}>{t("visits.all")}</a>
        {(["mobile", "tablet", "desktop"] as const).map((d) => (
          <a key={d} href={base({ device: d, page: undefined })} className={chip(device === d)}>{t(`device.${d}`)}</a>
        ))}
      </div>
      {countries.some((c) => c.key) && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold text-ink-soft">{t("visits.filterCountry")} :</span>
          <a href={base({ country: undefined, page: undefined })} className={chip(!country)}>{t("visits.all")}</a>
          {countries.filter((c) => c.key).map((c) => (
            <a key={c.key} href={base({ country: c.key!, page: undefined })} className={`${chip(country === c.key)} inline-flex items-center gap-1`}>
              <Flag code={c.key} locale={locale} /> {c.key} ({c.count})
            </a>
          ))}
        </div>
      )}
      {shown.length === 0 ? (
        <Card><p className="text-sm text-ink-soft">{t("visits.empty")}</p></Card>
      ) : (
        shown.map((v) => <VisitCard key={v.sessionId} v={v} t={t} locale={locale} journey={paths.get(v.sessionId)} />)
      )}
      <div className="flex justify-between">
        {page > 1 ? <a href={base({ page: String(page - 1) })} className="text-sm font-semibold text-brand underline">← {t("visits.prev")}</a> : <span />}
        {hasNext && <a href={base({ page: String(page + 1) })} className="text-sm font-semibold text-brand underline">{t("visits.next")} →</a>}
      </div>
    </div>
  );
}
