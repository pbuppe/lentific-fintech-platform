import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Button } from "@fintech/ui";
import { SUPPORTED_LOCALES, type Locale } from "../../../i18n/locales";
import { LOCALE_TO_COUNTRY } from "../../../i18n/countries";
import { LOCALE_TO_SLUG } from "../../../i18n/slugs";
import { LocaleCookieSetter } from "../../components/LocaleCookieSetter";

/**
 * Page de destination par langue (§ demande produit 2026-09-18) : une URL
 * dédiée et stable par langue (/fr/bienvenue, /de/willkommen, /hu/udvozlunk...),
 * utilisable telle quelle dans une campagne publicitaire ou un lien de
 * sponsoring, indépendante du cookie de langue ou du navigateur du visiteur
 * (contrairement à "/", qui suit la préférence de langue déjà enregistrée).
 * Le deuxième segment est lui-même traduit (§ demande produit 2026-09-18,
 * suite : "les thèmes du lien" doivent changer de langue en langue, pas
 * rester un mot générique identique) : /en/bienvenue ou /fr/welcome 404ent,
 * seule la paire langue/slug attendue (voir i18n/slugs.ts) fonctionne.
 * Générée statiquement pour les 8 langues au build (rapide, indexable), sans
 * dépendance à la base de données : pas d'aperçu marketplace ici, seulement
 * le contenu de présentation.
 */
const STEP_NUMBERS = ["01", "02", "03", "04", "05"];

type Props = { params: { locale: string; slug: string } };

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale, slug: LOCALE_TO_SLUG[locale] }));
}

function isValidRoute(params: { locale: string; slug: string }): params is { locale: Locale; slug: string } {
  return SUPPORTED_LOCALES.includes(params.locale as Locale) && LOCALE_TO_SLUG[params.locale as Locale] === params.slug;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isValidRoute(params)) return {};
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: "LandingPage" });
  const title = `${t("heroTitlePart1")} ${t("heroTitleHighlight")}${t("heroTitlePart2")}`;
  return {
    title: `Lentific · ${title}`,
    description: t("heroSubtitle"),
  };
}

export default async function LocaleLandingPage({ params }: Props) {
  if (!isValidRoute(params)) notFound();
  const locale = params.locale as Locale;
  const country = LOCALE_TO_COUNTRY[locale];
  const t = await getTranslations({ locale, namespace: "LandingPage" });

  const BORROWER_STEPS = (t.raw("borrowerSteps") as { title: string; body: string }[]).map((s, i) => ({
    n: STEP_NUMBERS[i],
    ...s,
  }));
  const INVESTOR_STEPS = (t.raw("investorSteps") as { title: string; body: string }[]).map((s, i) => ({
    n: STEP_NUMBERS[i],
    ...s,
  }));
  const TRUST_POINTS = t.raw("trustPoints") as { title: string; body: string }[];

  return (
    <main>
      <LocaleCookieSetter locale={locale} country={country} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand to-brand-ink px-6 py-16 text-white sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-white/70">{t("eyebrow")}</p>
          <h1 className="font-display text-4xl font-semibold text-balance sm:text-5xl">
            {t("heroTitlePart1")} <span className="text-[#FF9AA2]">{t("heroTitleHighlight")}</span>{t("heroTitlePart2")}
          </h1>
          <p className="mt-4 max-w-xl text-white/80">{t("heroSubtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="primary" href="/signup?role=BORROWER">{t("ctaApply")}</Button>
            <Button variant="ghost" href="/marketplace" className="border-white/30 text-white hover:bg-white/10">
              {t("ctaMarketplace")}
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/70">
            <a href="/login" className="underline underline-offset-4 hover:text-white">{t("alreadyAccount")}</a>
          </div>
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
      <section className="px-6 py-16 sm:px-12">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("howItWorksEyebrow")}</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">{t("howItWorksTitle")}</h2>

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
            <p className="font-display text-sm font-semibold text-ink">{t("introBoxTitle")}</p>
            <p className="mt-1 text-sm text-ink-soft">{t("introBoxBody")}</p>
            <p className="mt-2 text-xs text-ink-faint">{t("introBoxDisclaimer")}</p>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 py-16 text-center sm:px-12">
        <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{t("ctaFinalTitle")}</h2>
        <p className="mx-auto mt-2 max-w-xl text-ink-soft">{t("ctaFinalBody")}</p>
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
