import { Button, Card, StatusPill } from "@fintech/ui";
import { commercialPrices } from "../lib/price";
import { prisma } from "@fintech/database";
import { listOpportunities, listOpenInvestorListings } from "@fintech/funding";
import { getTranslations } from "next-intl/server";
import { getPreferredCountry } from "../lib/country";
import { CountryBadge } from "./components/CountryBadge";
import { HeroEstimator } from "./components/HeroEstimator";
import { ServicesSection, AboutSection, FaqSection, ContactSection, SiteFooter } from "./components/BrokerSections";
import { PremiumHomeSection } from "./components/PremiumPromo";
import { SeoJsonLd } from "./components/SeoJsonLd";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { pageMetadata } from "../lib/seo";
import type { Locale } from "../i18n/locales";

const STEP_NUMBERS = ["01", "02", "03", "04", "05"];

/** « / » : version par défaut (x-default) de l accueil, reliée aux 8 adresses par langue. */
export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Seo");
  return pageMetadata({ locale, title: t("homeTitle"), description: t("homeDescription"), keywords: t("keywords"), path: "/", pathFor: (l) => `/${l}`, xDefault: "/" });
}

export default async function LandingPage({ searchParams }: { searchParams: { contact?: string } }) {
  const t = await getTranslations("LandingPage");
  const tb = await getTranslations("HomeBroker.hero");
  const BORROWER_STEPS = (t.raw("borrowerSteps") as { title: string; body: string }[]).map((s, i) => ({
    n: STEP_NUMBERS[i],
    ...s,
  }));
  const INVESTOR_STEPS = (t.raw("investorSteps") as { title: string; body: string }[]).map((s, i) => ({
    n: STEP_NUMBERS[i],
    ...s,
  }));
  const RISK_LABEL = t.raw("riskLabel") as Record<string, string>;

  // Aperçu marketplace filtré sur le pays déduit de la langue du navigateur
  // (§ demande produit 2026-09-17) ; les chiffres globaux de la bannière
  // restent, eux, tous pays confondus (indicateurs de confiance de la
  // plateforme entière, pas de la seule sélection géographique courante).
  const country = getPreferredCountry();
  const [opportunities, investorListings, investedAgg, fundedDossiersCount, verifiedInvestorsCount] = await Promise.all([
    listOpportunities(country ?? undefined).catch(() => []),
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
      <SeoJsonLd />
      {/* Hero (maquette Lentific : message courtier + estimation de mensualité) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand to-brand-ink px-6 py-14 text-white sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-sand/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-white/70">{tb("eyebrow")}</p>
            <h1 className="font-display text-4xl font-semibold text-balance sm:text-5xl">{tb("title")}</h1>
            <p className="mt-4 max-w-xl text-white/80">{tb("lead")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#contact" className="inline-block rounded-lg bg-bg px-4 py-2.5 text-sm font-semibold text-brand-ink hover:bg-white">
                {tb("ctaStudy")}
              </a>
              <Button variant="ghost" href="/signup?role=BORROWER" className="border-white/30 text-white hover:bg-white/10">
                {t("ctaApply")}
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
              <span>✓ {tb("trust1")}</span>
              <span>✓ {tb("trust2")}</span>
              <a href="/login" className="underline underline-offset-4 hover:text-white">{t("alreadyAccount")}</a>
            </div>
          </div>
          <HeroEstimator />
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

      <ServicesSection />

      <PremiumHomeSection />

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
              {t("introBoxTitle", { fee: (await commercialPrices()).fee })}
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

      <AboutSection />

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
                {country ? t("noOpportunitiesInCountryHome") : t("noOpportunities")}
              </p>
            </Card>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {preview.map((opp) => {
                const funded = Number(opp.fundedAmount);
                const target = Number(opp.targetAmount);
                const pct = target > 0 ? Math.min(100, Math.round((funded / target) * 100)) : 0;
                const application = opp.loan.offer.application;
                return (
                  <Card key={opp.id}>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-base text-ink">{application.purpose}</h3>
                      <div className="flex items-center gap-1.5">
                        <CountryBadge countryCode={application.country.code} currencyCode={application.currency.code} />
                        <StatusPill tone={opp.riskLevel === "high" ? "risk" : opp.riskLevel === "low" ? "ok" : "pending"}>
                          {t("riskPill", { label: RISK_LABEL[opp.riskLevel] ?? opp.riskLevel })}
                        </StatusPill>
                      </div>
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

      <FaqSection />

      <ContactSection status={searchParams.contact} />

      <SiteFooter />
    </main>
  );
}
