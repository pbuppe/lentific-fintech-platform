import type { getTranslations } from "next-intl/server";
import type { VisitSummary, JourneyStep } from "@fintech/database";
import { Card } from "@fintech/ui";

/** Composants d'affichage partagés des statistiques (page principale et fiche visiteur). */
export type T = Awaited<ReturnType<typeof getTranslations>>;
// ---------------------------------------------------------------------------
// Petits composants d'affichage
// ---------------------------------------------------------------------------

export function regionName(locale: string, code: string | null) {
  if (!code || !/^[A-Z]{2}$/i.test(code)) return null;
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

/** Drapeau en image (les drapeaux emoji ne s'affichent pas sous Windows). */
export function Flag({ code, locale }: { code: string | null; locale: string }) {
  const name = regionName(locale, code);
  if (!code || !name) return <span className="inline-block h-[15px] w-5 rounded-sm bg-line" aria-hidden />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`https://flagcdn.com/20x15/${code.toLowerCase()}.png`} srcSet={`https://flagcdn.com/40x30/${code.toLowerCase()}.png 2x`} width={20} height={15} alt={name} title={name} className="inline-block rounded-sm shadow-sm" />
  );
}

export function DeviceIcon({ type }: { type: string | null }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, "aria-hidden": true } as const;
  if (type === "mobile")
    return (<svg {...common}><rect x="7" y="2.5" width="10" height="19" rx="2" /><path d="M11 18.5h2" /></svg>);
  if (type === "tablet")
    return (<svg {...common}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M11 18h2" /></svg>);
  return (<svg {...common}><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M8 20h8M12 16v4" /></svg>);
}

export function formatDuration(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h) return `${h} h ${String(m).padStart(2, "0")} min`;
  if (m) return `${m} min ${String(sec).padStart(2, "0")} s`;
  return `${sec} s`;
}

export function deviceLabel(t: T, v: Pick<VisitSummary, "deviceType" | "os">) {
  if (v.os === "iOS") return "iPhone";
  if (v.os === "iPadOS") return "iPad";
  if (v.os === "Android") return v.deviceType === "tablet" ? t("device.androidTablet") : t("device.androidPhone");
  return v.deviceType ? t(`device.${v.deviceType}` as "device.desktop") : t("device.unknown");
}

export function sourceLabel(t: T, v: Pick<VisitSummary, "referrer" | "utmSource">) {
  if (v.utmSource) return v.utmSource === "email" ? t("visit.sourceEmail") : v.utmSource;
  if (!v.referrer) return t("visit.direct");
  try {
    return new URL(v.referrer).hostname.replace(/^www\./, "");
  } catch {
    return v.referrer.slice(0, 40);
  }
}

export function Bars({ title, rows, locale, t, flags = false, total }: { title: string; rows: { key: string | null; label: string; count: number; icon?: React.ReactNode; flag?: string | null }[]; locale: string; t: T; flags?: boolean; total: number }) {
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
export function EvolutionChart({ points, t, unit, locale }: { points: { key: string; visits: number; visitors: number; views: number }[]; t: T; unit: "hour" | "day" | "month"; locale: string }) {
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

export function VisitCard({ v, t, locale, journey, live = false, open = false }: { v: VisitSummary; t: T; locale: string; journey?: JourneyStep[]; live?: boolean; open?: boolean }) {
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
            {v.visitNumber > 1 ? (
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">{t("visitors.returning", { n: v.visitNumber })}</span>
            ) : (
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">{t("visitors.new")}</span>
            )}
            {v.visitorId && <a href={`/statistiques/visiteur/${v.visitorId}`} className="text-xs font-semibold text-brand underline">{t("visitors.history")}</a>}
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

