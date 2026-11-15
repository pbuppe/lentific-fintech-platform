import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { pageViewsRepo, visitAnalyticsRepo, type StatsRange, type VisitSummary, type JourneyStep } from "@fintech/database";
import { Card } from "@fintech/ui";
import { getCurrentUser } from "../../../lib/session";
import { AutoRefresh } from "../../components/AutoRefresh";
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

type T = Awaited<ReturnType<typeof getTranslations>>;

type Search = { range?: string; tab?: string; device?: string; country?: string; page?: string };

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

      {tab === "overview" && <Overview t={t} locale={locale} range={range} />}
      {tab === "live" && <Live t={t} locale={locale} />}
      {tab === "visits" && <Visits t={t} locale={locale} range={range} searchParams={searchParams} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Petits composants d'affichage
// ---------------------------------------------------------------------------

function regionName(locale: string, code: string | null) {
  if (!code || !/^[A-Z]{2}$/i.test(code)) return null;
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

/** Drapeau en image (les drapeaux emoji ne s'affichent pas sous Windows). */
function Flag({ code, locale }: { code: string | null; locale: string }) {
  const name = regionName(locale, code);
  if (!code || !name) return <span className="inline-block h-[15px] w-5 rounded-sm bg-line" aria-hidden />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`https://flagcdn.com/20x15/${code.toLowerCase()}.png`} srcSet={`https://flagcdn.com/40x30/${code.toLowerCase()}.png 2x`} width={20} height={15} alt={name} title={name} className="inline-block rounded-sm shadow-sm" />
  );
}

function DeviceIcon({ type }: { type: string | null }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, "aria-hidden": true } as const;
  if (type === "mobile")
    return (<svg {...common}><rect x="7" y="2.5" width="10" height="19" rx="2" /><path d="M11 18.5h2" /></svg>);
  if (type === "tablet")
    return (<svg {...common}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M11 18h2" /></svg>);
  return (<svg {...common}><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M8 20h8M12 16v4" /></svg>);
}

function formatDuration(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h) return `${h} h ${String(m).padStart(2, "0")} min`;
  if (m) return `${m} min ${String(sec).padStart(2, "0")} s`;
  return `${sec} s`;
}

function deviceLabel(t: T, v: Pick<VisitSummary, "deviceType" | "os">) {
  if (v.os === "iOS") return "iPhone";
  if (v.os === "iPadOS") return "iPad";
  if (v.os === "Android") return v.deviceType === "tablet" ? t("device.androidTablet") : t("device.androidPhone");
  return v.deviceType ? t(`device.${v.deviceType}` as "device.desktop") : t("device.unknown");
}

function sourceLabel(t: T, v: Pick<VisitSummary, "referrer" | "utmSource">) {
  if (v.utmSource) return v.utmSource === "email" ? t("visit.sourceEmail") : v.utmSource;
  if (!v.referrer) return t("visit.direct");
  try {
    return new URL(v.referrer).hostname.replace(/^www\./, "");
  } catch {
    return v.referrer.slice(0, 40);
  }
}

function Bars({ title, rows, locale, t, flags = false, total }: { title: string; rows: { key: string | null; label: string; count: number; icon?: React.ReactNode; flag?: string | null }[]; locale: string; t: T; flags?: boolean; total: number }) {
  return (
    <Card>
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{title}</p>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">{t("noData")}</p>
      ) : (
        <ul className="mt-3 grid gap-2">
          {rows.map((r) => {
            const pct = total ? Math.round((r.count / total) * 100) : 0;
            return (
              <li key={`${r.key}-${r.label}`} className="text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2 text-ink">
                    {flags && <Flag code={r.flag ?? r.key} locale={locale} />}
                    {r.icon}
                    <span className="truncate">{r.label}</span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-ink-faint">{r.count} · {pct} %</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-surface-alt">
                  <div className="h-1.5 rounded-full bg-brand" style={{ width: `${Math.max(2, pct)}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

/** Courbe d'évolution en SVG (sans bibliothèque) : visites, visiteurs et pages vues. */
function EvolutionChart({ points, t, unit, locale }: { points: { key: string; visits: number; visitors: number; views: number }[]; t: T; unit: "hour" | "day" | "month"; locale: string }) {
  const W = 760, H = 220, P = { l: 36, r: 12, t: 12, b: 28 };
  const max = Math.max(1, ...points.map((p) => Math.max(p.views, p.visits, p.visitors)));
  const nice = max <= 4 ? 4 : Math.ceil(max / 4) * 4;
  const x = (i: number) => P.l + (points.length <= 1 ? 0 : (i / (points.length - 1)) * (W - P.l - P.r));
  const y = (v: number) => H - P.b - (v / nice) * (H - P.t - P.b);
  const line = (k: "views" | "visits" | "visitors") => points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p[k]).toFixed(1)}`).join(" ");
  const area = `${line("visits")} L${x(points.length - 1).toFixed(1)},${H - P.b} L${x(0).toFixed(1)},${H - P.b} Z`;
  const fmt = (key: string) => {
    const d = new Date(unit === "hour" ? `${key}:00:00Z` : unit === "month" ? `${key}-01T00:00:00Z` : `${key}T00:00:00Z`);
    return unit === "hour"
      ? new Intl.DateTimeFormat(locale, { hour: "2-digit" }).format(d)
      : unit === "month"
        ? new Intl.DateTimeFormat(locale, { month: "short" }).format(d)
        : new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(d);
  };
  const step = Math.max(1, Math.ceil(points.length / 8));
  return (
    <Card className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("chart.title")}</p>
        <div className="flex gap-3 text-xs text-ink-soft">
          <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-brand" />{t("chart.visits")}</span>
          <span className="flex items-center gap-1"><span className="h-0.5 w-3 bg-accent" />{t("chart.visitors")}</span>
          <span className="flex items-center gap-1"><span className="h-0.5 w-3 border-t-2 border-dashed border-ink-faint" />{t("chart.views")}</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-auto w-full" role="img" aria-label={t("chart.title")}>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line x1={P.l} x2={W - P.r} y1={y(nice * f)} y2={y(nice * f)} stroke="currentColor" className="text-line" strokeWidth={1} />
            <text x={P.l - 6} y={y(nice * f) + 4} textAnchor="end" fontSize={10} className="fill-ink-faint">{Math.round(nice * f)}</text>
          </g>
        ))}
        <path d={area} className="fill-brand/10" />
        <path d={line("views")} fill="none" stroke="currentColor" className="text-ink-faint" strokeWidth={1.5} strokeDasharray="4 3" />
        <path d={line("visits")} fill="none" stroke="currentColor" className="text-brand" strokeWidth={2.5} />
        <path d={line("visitors")} fill="none" stroke="currentColor" className="text-accent" strokeWidth={1.8} />
        {points.map((p, i) => (
          <g key={p.key}>
            <circle cx={x(i)} cy={y(p.visits)} r={points.length > 40 ? 0 : 3} className="fill-brand" />
            <rect x={x(i) - (W / points.length) / 2} y={P.t} width={W / points.length} height={H - P.t - P.b} fill="transparent">
              <title>{`${fmt(p.key)} — ${t("chart.visits")} : ${p.visits} · ${t("chart.visitors")} : ${p.visitors} · ${t("chart.views")} : ${p.views}`}</title>
            </rect>
            {i % step === 0 && <text x={x(i)} y={H - 8} textAnchor="middle" fontSize={10} className="fill-ink-faint">{fmt(p.key)}</text>}
          </g>
        ))}
      </svg>
    </Card>
  );
}

function VisitCard({ v, t, locale, journey, live = false, open = false }: { v: VisitSummary; t: T; locale: string; journey?: JourneyStep[]; live?: boolean; open?: boolean }) {
  const time = new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" });
  const clock = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const geoName = regionName(locale, v.geoCountryCode);
  const originName = regionName(locale, v.originCountryCode);
  return (
    <Card accented={live}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-display text-base text-ink">
            <Flag code={v.geoCountryCode} locale={locale} />
            <span>{geoName ?? t("visit.unknownCountry")}{v.city ? ` · ${v.city}` : ""}</span>
            {v.userId ? (
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">{t("visit.member", { name: v.userName ?? v.userEmail ?? "" })}</span>
            ) : (
              <span className="rounded-full bg-surface-alt px-2 py-0.5 text-xs text-ink-soft">{t("visit.anonymous")}</span>
            )}
            <span className="text-xs text-ink-faint">{t("visit.visitNumber", { n: v.visitNumber })}</span>
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
            <span className="flex items-center gap-1">{t("visit.origin")} : <Flag code={v.originCountryCode} locale={locale} /> {originName ?? t("visit.unknownCountry")}</span>
            <span className="flex items-center gap-1 text-ink"><DeviceIcon type={v.deviceType} />{deviceLabel(t, v)}{v.os && !["iOS", "iPadOS"].includes(v.os) ? ` · ${v.os}` : v.os ? ` · ${v.os}` : ""}{v.browser ? ` · ${v.browser}` : ""}{v.screenWidth ? ` · ${v.screenWidth}px` : ""}</span>
            <span>{t("visit.source")} : {sourceLabel(t, v)}</span>
            {v.locale && <span>{t("visit.language")} : {v.locale.toUpperCase()}</span>}
          </p>
        </div>
        <div className="text-right text-xs text-ink-soft">
          <p className="font-display text-lg text-brand-ink">{formatDuration(v.durationMs)}</p>
          <p>{t("visit.pagesActions", { pages: v.pages, actions: v.events })}</p>
          <p className="text-ink-faint">{time.format(v.firstAt)}</p>
        </div>
      </div>
      {live && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-ink">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
          {t("visit.currentPage")} : <span className="font-semibold">{v.currentPath}</span>
          <span className="text-xs text-ink-faint">· {t("visit.lastActivity", { time: clock.format(v.lastAt) })}</span>
        </p>
      )}
      {journey && journey.length > 0 && (
        <details className="mt-3" open={open}>
          <summary className="cursor-pointer text-sm font-semibold text-brand">{t("visit.journey")}</summary>
          <ol className="mt-2 grid gap-1 border-l-2 border-line pl-4">
            {journey.map((s, i) =>
              s.type === "page" ? (
                <li key={i} className="text-sm">
                  <span className="font-mono text-xs text-ink-faint">{clock.format(s.at)}</span>{" "}
                  <span className="font-semibold text-ink">{s.path}</span>{" "}
                  <span className="text-xs text-ink-soft">{s.durationMs != null ? `· ${formatDuration(s.durationMs)}` : ""}</span>
                </li>
              ) : (
                <li key={i} className="text-sm text-ink-soft">
                  <span className="font-mono text-xs text-ink-faint">{clock.format(s.at)}</span>{" "}
                  <span className="rounded bg-accent/10 px-1.5 py-0.5 text-xs font-semibold text-accent">{t(`event.${s.kind}` as "event.click")}</span>{" "}
                  « {s.label} »{s.kind === "outbound" && s.target ? <span className="text-xs text-ink-faint"> → {s.target.replace(/^https?:\/\//, "").slice(0, 60)}</span> : null}
                </li>
              )
            )}
          </ol>
        </details>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Onglets
// ---------------------------------------------------------------------------

async function Overview({ t, locale, range }: { t: T; locale: string; range: StatsRange }) {
  const since = pageViewsRepo.rangeToSince(range);
  const unit = range === "24h" ? "hour" : range === "1y" ? "month" : "day";
  const [kpis, views, series, visitsSeries, devices, oses, browsers, geo, origin, cities, referrers, entries, pages, events] = await Promise.all([
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
  ];

  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
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
    </>
  );
}

async function Live({ t, locale }: { t: T; locale: string }) {
  const visits = await visitAnalyticsRepo.liveVisits(5);
  const paths = await visitAnalyticsRepo.journeys(visits.map((v) => v.sessionId));
  return (
    <div className="mt-4 grid gap-3">
      <p className="text-sm text-ink-soft">{t("live.hint")}</p>
      {visits.length === 0 ? (
        <Card><p className="text-sm text-ink-soft">{t("live.empty")}</p></Card>
      ) : (
        visits.map((v) => <VisitCard key={v.sessionId} v={v} t={t} locale={locale} journey={paths.get(v.sessionId)} live open />)
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
