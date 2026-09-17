import { Button, Card, StatusPill } from "@fintech/ui";
import { prisma } from "@fintech/database";
import { listOpportunities, listOpenInvestorListings } from "@fintech/funding";
import { getTranslations } from "next-intl/server";

const STEP_NUMBERS = ["01", "02", "03", "04", "05"];

export default async function LandingPage() {
  const t = await getTranslations("LandingPage");
  const BORROWER_STEPS = (t.raw("borrowerSteps") as { title: string; body: string }[]).map((s, i) => ({
    n: STEP_NUMBERS[i],
    ...s,
  }));
  const INVESTOR_STEPS = (t.raw("investorSteps") as { title: string; body: string }[]).map((s, i) => ({
    n: STEP_NUMBERS[i],
    ...s,
  }));
  const TRUST_POINTS = t.raw("trustPoints") as { title: string; body: string }[];
  const RISK_LABEL = t.raw("riskLabel") as Record<string, string>;

  const [opportunities, investorListings, investedAgg, fundedDossiersCount, verifiedInvestorsCount] = await Promise.all([
    listOpportunities().catch(() => []),
    listOpenInvestorListings().catch(() => []),
    prisma.investment.aggregate({ _sum: { amount: true } }).catch(() => ({ _sum: { amount: null } })),
    prisma.application.count({ where: { status: { in: ["CONTRACT_SIGNED", "DISBURSED"] } } }).catch(() => 0),
    prisma.investorProfile.count({ where: { verificationStatus: "VERIFIED" } }).catch(() => 0),
  ]);
  const preview = opportunities.slice(0, 2);
  const totalAvailable = investorListings.reduce((sum, l) => sum + Number(l.amountAvailable), 0);
  const totalInvested = Number(investedAgg._sum.amount ?? 0);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand to-brand-ink px-6 py-16 text-white sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-white/70">
            {t("eyebrow")}
          </p>
          <h1 className="font-display text-4xl font-semibold text-balance sm:text-5xl">
            {t("heroTitlePart1")} <span className="text-[#FF9AA2]">{t("heroTitleHighlight")}</span>{t("heroTitlePart2")}
          </h1>
          <p className="mt-4 max-w-xl text-white/80">
            {t("heroSubtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="primary" href="/signup?role=BORROWER">
              {t("ctaApply")}
            </Button>
            <Button variant="ghost" href="/marketplace" className="border-white/30 text-white hover:bg-white/10">
              {t("ctaMarketplace")}
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/70">
            <a href="/login" className="underline underline-offset-4 hover:text-white">{t("alreadyAccount")}</a>
          </div>
        </div>
      </section>

      {/* Chiffres de la plateforme */}
      <section className="border-b border-line bg-surface px-6 py-6 sm:px-12">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            <div>
              <p className="font-display text-2xl font-semibold text-brand-ink">
                {totalAvailable.toLocaleString("fr-FR")} €
              </p>
              <p className="text-xs text-ink-faint">{t("statAvailableLabel")}</p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-brand-ink">
                {totalInvested.toLocaleString("fr-FR")} €
              </p>
              <p className="text-xs text-ink-faint">{t("statInvestedLabel")}</p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-brand-ink">{fundedDossiersCount}</p>
              <p className="text-xs text-ink-faint">{t("statDossiers", { count: fundedDossiersCount })}</p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-brand-ink">{verifiedInvestorsCount}</p>
              <p className="text-xs text-ink-faint">{t("statInvestors", { count: verifiedInvestorsCount })}</p>
            </div>
          </div>
          <Button variant="ghost" href="/marketplace">{t("viewOffers")}</Button>
        </div>
      </section>

      {/* Points clés */}
      <section className="bg-surface-alt px-6 py-14 sm:px-12">
        <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_POINTS.map((f, i) => (
            <div key={f.title} className="rounded-xl border border-line bg-surface p-5">
              <div className="font-mono text-xs font-semibold text-accent">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="mt-1.5 font-display text-lg text-brand-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="comment-ca-marche" className="px-6 py-16 sm:px-12">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("howItWorksEyebrow")}</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
            {t("howItWorksTitle")}
          </h2>

          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">{t("borrowerColumnTitle")}</h3>
              <ol className="mt-4 grid gap-4">
                {BORROWER_STEPS.map((s) => (
                  <li key={s.n} className="flex gap-3">
                    <span className="font-mono text-xs font-semibold text-accent">{s.n}</span>
                    <div>
                      <p className="font-display text-sm font-semibold text-ink">{s.title}</p>
                      <p className="text-sm text-ink-soft">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Button variant="link" href="/signup?role=BORROWER" className="mt-4 inline-block">
                {t("applyLinkArrow")}
              </Button>
            </div>

            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">{t("investorColumnTitle")}</h3>
              <ol className="mt-4 grid gap-4">
                {INVESTOR_STEPS.map((s) => (
                  <li key={s.n} className="flex gap-3">
                    <span className="font-mono text-xs font-semibold text-accent">{s.n}</span>
                    <div>
                      <p className="font-display text-sm font-semibold text-ink">{s.title}</p>
                      <p className="text-sm text-ink-soft">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Button variant="link" href="/marketplace" className="mt-4 inline-block">
                {t("viewMarketplaceLinkArrow")}
              </Button>
            </div>
          </div>

          <div className="mt-10 rounded-xl border border-line bg-surface-alt p-5">
            <p className="font-display text-sm font-semibold text-ink">
              {t("introBoxTitle")}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {t("introBoxBody")}
            </p>
            <p className="mt-2 text-xs text-ink-faint">
              {t("introBoxDisclaimer")}
            </p>
          </div>
        </div>
      </section>

      {/* Aperçu marketplace */}
      <section className="bg-surface-alt px-6 py-16 sm:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("marketplaceEyebrow")}</p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
                {t("marketplaceTitle")}
              </h2>
            </div>
            <Button variant="ghost" href="/marketplace" className="hidden sm:inline-block">
              {t("viewAll")}
            </Button>
          </div>

          {preview.length === 0 ? (
            <Card className="mt-6">
              <p className="text-sm text-ink-soft">
                {t("noOpportunities")}
              </p>
            </Card>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {preview.map((opp) => {
                const funded = Number(opp.fundedAmount);
                const target = Number(opp.targetAmount);
                const pct = target > 0 ? Math.min(100, Math.round((funded / target) * 100)) : 0;
                return (
                  <Card key={opp.id}>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-base text-ink">{opp.loan.offer.application.purpose}</h3>
                      <StatusPill tone={opp.riskLevel === "high" ? "risk" : opp.riskLevel === "low" ? "ok" : "pending"}>
                        {t("riskPill", { label: RISK_LABEL[opp.riskLevel] ?? opp.riskLevel })}
                      </StatusPill>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface">
                      <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-2 text-sm text-ink-soft">
                      {t("fundedProgress", { funded: funded.toLocaleString("fr-FR"), target: target.toLocaleString("fr-FR"), pct })}
                    </p>
                  </Card>
                );
              })}
            </div>
          )}
          <Button variant="ghost" href="/marketplace" className="mt-4 inline-block sm:hidden">
            {t("viewAll")}
          </Button>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 py-16 text-center sm:px-12">
        <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{t("ctaFinalTitle")}</h2>
        <p className="mx-auto mt-2 max-w-xl text-ink-soft">
          {t("ctaFinalBody")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="primary" href="/signup?role=BORROWER">{t("ctaApply")}</Button>
          <Button variant="ghost" href="/signup?role=INVESTOR">{t("becomeInvestor")}</Button>
        </div>
      </section>

      <footer className="border-t border-line px-6 py-8 text-sm text-ink-faint sm:px-12">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <span>{t("footerText", { year: new Date().getFullYear() })}</span>
          <div className="flex gap-4">
            <a href="/marketplace" className="hover:text-ink">{t("footerMarketplace")}</a>
            <a href="/simulateur" className="hover:text-ink">{t("footerSimulator")}</a>
            <a href="/login" className="hover:text-ink">{t("footerLogin")}</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
