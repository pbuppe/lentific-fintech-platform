import { visitAnalyticsRepo } from "@fintech/database";
import { Card } from "@fintech/ui";
import { DeviceIcon, Flag, deviceLabel, formatDuration, regionName, type T } from "./components";

/**
 * Liste des visiteurs en bas des statistiques (demande produit 2026-11-16) :
 * une ligne par visiteur, nouveau ou revenant (nombre de visites depuis la
 * première), pays, appareil, temps passé, actions ; filtres pays / type
 * d'action / nombre de lignes ; lien vers l'historique complet du visiteur.
 */
const ROWS = [10, 50, 100, 200];
const ACTIONS = ["click", "submit", "outbound", "download"] as const;

export async function VisitorsTable({ t, locale, since, range, params }: { t: T; locale: string; since: Date; range: string; params: { vcountry?: string; vaction?: string; vrows?: string } }) {
  const country = /^[A-Z]{2}$/.test(params.vcountry ?? "") ? params.vcountry : undefined;
  const action = (ACTIONS as readonly string[]).includes(params.vaction ?? "") ? params.vaction : undefined;
  const rows = ROWS.includes(Number(params.vrows)) ? Number(params.vrows) : 50;
  const [visitors, countries] = await Promise.all([
    visitAnalyticsRepo.visitorsTable(since, { country, action, limit: rows }),
    visitAnalyticsRepo.breakdown(since, "geo", 50),
  ]);
  const dt = new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" });
  const select = "rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm text-ink";

  return (
    <section id="visiteurs" className="mt-8 scroll-mt-6">
      <h2 className="font-display text-lg font-semibold text-ink">{t("visitors.title")}</h2>
      <p className="mt-1 max-w-3xl text-sm text-ink-soft">{t("visitors.hint")}</p>

      <form method="get" action="/statistiques#visiteurs" className="mt-3 flex flex-wrap items-end gap-3">
        <input type="hidden" name="tab" value="overview" />
        <input type="hidden" name="range" value={range} />
        <label className="grid gap-1 text-xs font-semibold text-ink-soft">
          {t("visitors.country")}
          <select name="vcountry" defaultValue={country ?? ""} className={select}>
            <option value="">{t("visits.all")}</option>
            {countries.filter((c) => c.key).map((c) => (
              <option key={c.key} value={c.key!}>{regionName(locale, c.key) ?? c.key} ({c.count})</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-ink-soft">
          {t("visitors.action")}
          <select name="vaction" defaultValue={action ?? ""} className={select}>
            <option value="">{t("visitors.anyAction")}</option>
            {ACTIONS.map((a) => <option key={a} value={a}>{t(`event.${a}`)}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-ink-soft">
          {t("visitors.rows")}
          <select name="vrows" defaultValue={String(rows)} className={select}>
            {ROWS.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <button className="rounded-lg bg-yellow px-4 py-2 text-sm font-semibold text-ink hover:bg-yellow-ink">{t("visitors.apply")}</button>
      </form>

      <Card className="mt-3">
        {visitors.length === 0 ? (
          <p className="text-sm text-ink-soft">{t("visitors.empty")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-xs text-ink-faint">
                <tr>
                  <th className="py-2 pr-3 font-semibold">{t("visitors.colVisitor")}</th>
                  <th className="py-2 pr-3 font-semibold">{t("visitors.colCountry")}</th>
                  <th className="py-2 pr-3 font-semibold">{t("visitors.colDevice")}</th>
                  <th className="py-2 pr-3 text-right font-semibold">{t("visitors.colVisits")}</th>
                  <th className="py-2 pr-3 font-semibold">{t("visitors.colFirst")}</th>
                  <th className="py-2 pr-3 font-semibold">{t("visitors.colLast")}</th>
                  <th className="py-2 pr-3 text-right font-semibold">{t("visitors.colTime")}</th>
                  <th className="py-2 pr-3 text-right font-semibold">{t("visitors.colPages")}</th>
                  <th className="py-2 pr-3 font-semibold">{t("visitors.colActions")}</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => {
                  const returning = v.totalVisits > 1;
                  return (
                    <tr key={v.visitorId} className="border-t border-line align-top">
                      <td className="py-2 pr-3">
                        {returning ? (
                          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">{t("visitors.returning", { n: v.totalVisits })}</span>
                        ) : (
                          <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">{t("visitors.new")}</span>
                        )}
                        {v.userName && <span className="mt-1 block text-xs text-ink">{t("visit.member", { name: v.userName })}</span>}
                        <span className="mt-1 block font-mono text-[10px] text-ink-faint">#{v.visitorId.slice(0, 8)}</span>
                      </td>
                      <td className="py-2 pr-3">
                        <span className="flex items-center gap-1.5 text-ink"><Flag code={v.geoCountryCode} locale={locale} />{regionName(locale, v.geoCountryCode) ?? t("visit.unknownCountry")}</span>
                        {v.city && <span className="block text-xs text-ink-soft">{v.city}</span>}
                        <span className="mt-0.5 flex items-center gap-1 text-xs text-ink-faint">{t("visit.origin")} : <Flag code={v.originCountryCode} locale={locale} /> {regionName(locale, v.originCountryCode) ?? "—"}</span>
                      </td>
                      <td className="py-2 pr-3">
                        <span className="flex items-center gap-1 text-ink"><DeviceIcon type={v.deviceType} />{deviceLabel(t, v)}</span>
                        <span className="block text-xs text-ink-faint">{[v.os, v.browser].filter(Boolean).join(" · ")}</span>
                      </td>
                      <td className="py-2 pr-3 text-right">
                        <span className="font-display text-base text-brand-ink">{v.totalVisits}</span>
                        {v.periodVisits !== v.totalVisits && <span className="block text-[10px] text-ink-faint">{t("visitors.inPeriod", { n: v.periodVisits })}</span>}
                      </td>
                      <td className="py-2 pr-3 text-xs text-ink-soft">{dt.format(v.firstAt)}</td>
                      <td className="py-2 pr-3 text-xs text-ink-soft">{dt.format(v.lastAt)}</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{formatDuration(v.durationMs)}</td>
                      <td className="py-2 pr-3 text-right font-mono text-xs">{v.pages}</td>
                      <td className="py-2 pr-3 text-xs">
                        {v.actions.total === 0 ? (
                          <span className="text-ink-faint">—</span>
                        ) : (
                          <>
                            <span className="flex flex-wrap gap-1">
                              {ACTIONS.filter((a) => v.actions[a] > 0).map((a) => (
                                <span key={a} className="rounded bg-accent/10 px-1.5 py-0.5 font-semibold text-accent">{t(`event.${a}`)} × {v.actions[a]}</span>
                              ))}
                            </span>
                            {v.lastActions.length > 0 && <span className="mt-1 block max-w-[220px] truncate text-ink-faint">« {v.lastActions.join(" », « ")} »</span>}
                          </>
                        )}
                      </td>
                      <td className="py-2 text-right">
                        <a href={`/statistiques/visiteur/${v.visitorId}`} className="whitespace-nowrap text-xs font-semibold text-brand underline">{t("visitors.history")}</a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
}
