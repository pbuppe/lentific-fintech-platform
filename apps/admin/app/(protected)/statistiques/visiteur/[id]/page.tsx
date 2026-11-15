import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { visitAnalyticsRepo } from "@fintech/database";
import { Card } from "@fintech/ui";
import { getCurrentUser } from "../../../../../lib/session";
import { Flag, VisitCard, formatDuration, regionName } from "../../components";

/**
 * Fiche d'un visiteur (demande produit 2026-11-16) : toutes ses visites, de la
 * plus récente à la toute première, avec le parcours, le temps passé et les
 * actions de chacune. Agents, admins et super admins.
 */
const STAFF = ["AGENT", "ADMIN", "SUPER_ADMIN"];

export default async function VisitorPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !STAFF.includes(user.role)) redirect("/");
  if (!/^[0-9a-z-]{16,40}$/i.test(params.id)) redirect("/statistiques");
  const t = await getTranslations("StatisticsPage");
  const locale = await getLocale();
  const visits = await visitAnalyticsRepo.visitorHistory(params.id);
  const journeys = await visitAnalyticsRepo.journeys(visits.map((v) => v.sessionId));
  const dt = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short" });

  const first = visits[visits.length - 1];
  const totalMs = visits.reduce((a, v) => a + v.durationMs, 0);
  const totalPages = visits.reduce((a, v) => a + v.pages, 0);
  const totalActions = visits.reduce((a, v) => a + v.events, 0);
  const countries = [...new Set(visits.map((v) => v.geoCountryCode).filter((c): c is string => !!c))];
  const member = visits.find((v) => v.userId);

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <a href="/statistiques#visiteurs" className="text-sm font-semibold text-brand underline">← {t("visitor.back")}</a>
      <p className="mt-4 font-mono text-xs uppercase tracking-widest text-ink-faint">{t("visitor.kicker")}</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-brand">
        {member ? t("visit.member", { name: member.userName ?? member.userEmail ?? "" }) : t("visitor.title", { id: params.id.slice(0, 8) })}
      </h1>

      {visits.length === 0 ? (
        <Card className="mt-6"><p className="text-sm text-ink-soft">{t("visitor.empty")}</p></Card>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Card>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{t("visitor.visits")}</p>
              <p className="mt-1 font-display text-xl font-semibold text-brand-ink">{visits.length}</p>
              <p className="text-xs text-ink-soft">{visits.length > 1 ? t("visitors.returning", { n: visits.length }) : t("visitors.new")}</p>
            </Card>
            <Card>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{t("visitor.firstVisit")}</p>
              <p className="mt-1 text-sm font-semibold text-ink">{dt.format(first.firstAt)}</p>
            </Card>
            <Card>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{t("visitor.totalTime")}</p>
              <p className="mt-1 font-display text-xl font-semibold text-brand-ink">{formatDuration(totalMs)}</p>
            </Card>
            <Card>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{t("visitor.pagesActions")}</p>
              <p className="mt-1 font-display text-xl font-semibold text-brand-ink">{totalPages} · {totalActions}</p>
            </Card>
            <Card>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{t("visitor.countries")}</p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink">
                {countries.length === 0 ? "—" : countries.map((c) => <span key={c} className="flex items-center gap-1"><Flag code={c} locale={locale} />{regionName(locale, c)}</span>)}
              </p>
            </Card>
          </div>

          <h2 className="mt-8 font-display text-lg font-semibold text-ink">{t("visitor.historyTitle")}</h2>
          <div className="mt-3 grid gap-3">
            {visits.map((v, i) => (
              <div key={v.sessionId}>
                <p className="mb-1 text-xs font-semibold text-ink-soft">{t("visitor.visitLabel", { n: visits.length - i })}</p>
                <VisitCard v={v} t={t} locale={locale} journey={journeys.get(v.sessionId)} open={i === 0} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
