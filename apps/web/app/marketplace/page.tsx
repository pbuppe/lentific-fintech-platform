import { listOpportunities, listOpenInvestorListings } from "@fintech/funding";
import { buildSchedule } from "@fintech/loans";
import { Card, StatusPill, Button } from "@fintech/ui";
import { getTranslations } from "next-intl/server";
import { getPreferredCountry } from "../../lib/country";
import { CountryFilter } from "../components/CountryFilter";
import { CountryBadge } from "../components/CountryBadge";

export default async function PublicMarketplacePage() {
  const t = await getTranslations("MarketplacePage");
  const RISK_LABEL = t.raw("riskLabel") as Record<string, string>;
  const RISK_APPETITE_LABEL = t.raw("riskAppetiteLabel") as Record<string, string>;
  const country = getPreferredCountry();
  const [opportunities, listings] = await Promise.all([
    listOpportunities(country ?? undefined).catch(() => []),
    listOpenInvestorListings(country ?? undefined).catch(() => []),
  ]);

  return (
    <main>
      <section className="bg-gradient-to-b from-brand to-brand-ink px-6 py-12 text-white sm:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-widest text-white/70">{t("eyebrow")}</p>
            <CountryFilter current={country} />
          </div>
          <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-3 max-w-2xl text-white/80">
            {t("heroSubtitle")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10 sm:px-12">
        <h2 className="font-display text-xl font-semibold text-ink">{t("availableCapitalTitle")}</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {t("availableCapitalSubtitle")}
        </p>

        {listings.length === 0 ? (
          <Card className="mt-4">
            <p className="text-sm text-ink-soft">{country ? t("noListingsInCountry") : t("noListings")}</p>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {listings.map((listing) => {
              const amount = Number(listing.amountAvailable);
              const rate = Number(listing.preferredRate);
              const monthly = buildSchedule(amount, listing.preferredDurationMonths, rate)[0]?.amount ?? 0;
              return (
                <Card key={listing.id} accented>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display text-lg text-brand-ink">
                      {t("amountAvailable", { amount: amount.toLocaleString("fr-FR") })}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {listing.investor.country && (
                        <CountryBadge
                          countryCode={listing.investor.country.code}
                          currencyCode={listing.investor.country.currency.code}
                        />
                      )}
                      {listing.investor.investorProfile?.verificationStatus === "VERIFIED" && (
                        <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                          {t("verifiedBadge")}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">
                    {t("listingMeta", { name: listing.investor.name ?? t("defaultInvestorName"), rate, duration: listing.preferredDurationMonths })}
                  </p>
                  <p className="mt-2 rounded-lg bg-surface-alt px-3 py-2 text-sm text-ink">
                    {t("monthlyEstimateLabel")} <span className="font-semibold">{t("monthlyEstimateValue", { monthly: monthly.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) })}</span>
                  </p>
                  <p className="mt-2 text-xs text-ink-faint">{RISK_APPETITE_LABEL[listing.riskAppetite] ?? listing.riskAppetite}</p>
                  <Button variant="ghost" href="/login" className="mt-3 inline-block text-center text-xs">
                    {t("connectCta")}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-6">
          <Button variant="primary" href="/demande">{t("depositCta")}</Button>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10 sm:px-12">
        <h2 className="font-display text-xl font-semibold text-ink">{t("signedDossiersTitle")}</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {t("signedDossiersSubtitle")}
        </p>

        {opportunities.length === 0 ? (
          <Card className="mt-4">
            <p className="text-sm text-ink-soft">
              {country ? t("noOpportunitiesInCountry") : t("noOpportunitiesPart1")}{" "}
              <a href="/signup?role=BORROWER" className="text-brand-ink underline">
                {t("noOpportunitiesLink")}
              </a>
              .
            </p>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {opportunities.map((opp) => {
              const funded = Number(opp.fundedAmount);
              const target = Number(opp.targetAmount);
              const pct = target > 0 ? Math.min(100, Math.round((funded / target) * 100)) : 0;
              const application = opp.loan.offer.application;
              const purpose = application.purpose;
              return (
                <Card key={opp.id}>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-lg text-ink">{purpose}</h3>
                    <div className="flex items-center gap-1.5">
                      <CountryBadge countryCode={application.country.code} currencyCode={application.currency.code} />
                      <StatusPill tone={opp.riskLevel === "high" ? "risk" : opp.riskLevel === "low" ? "ok" : "pending"}>
                        {t("riskPill", { label: RISK_LABEL[opp.riskLevel] ?? opp.riskLevel })}
                      </StatusPill>
                    </div>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-faint">{t("dossierRef", { reference: application.reference })}</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-alt">
                    <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-2 text-sm text-ink-soft">
                    {t("fundedProgress", { funded: funded.toLocaleString("fr-FR"), target: target.toLocaleString("fr-FR"), pct })}
                  </p>
                  <Button variant="primary" href="/signup?role=INVESTOR" className="mt-3 inline-block text-center text-xs">
                    {t("investCta")}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
