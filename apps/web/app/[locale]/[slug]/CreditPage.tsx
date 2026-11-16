import { getTranslations } from "next-intl/server";
import { Button } from "@fintech/ui";
import type { Locale } from "../../../i18n/locales";
import { CREDIT_PAGE_KEYS, creditPagePath, type CreditPageKey } from "../../../i18n/creditPages";
import { SITE_URL } from "../../../lib/seo";
import { SiteFooter } from "../../components/BrokerSections";

/**
 * Page d'un type de crédit dans une langue (SEO, 2026-11-16) : titre et
 * texte dans les mots recherchés sur Google, avantages, questions
 * fréquentes (aussi en données structurées FAQ) et appel à l'action vers
 * l'étude gratuite.
 */
type Point = { t: string; b: string };
type Faq = { q: string; a: string };

export async function CreditPage({ locale, pageKey }: { locale: Locale; pageKey: CreditPageKey }) {
  const t = await getTranslations({ locale, namespace: `CreditPages.${pageKey}` });
  const c = await getTranslations({ locale, namespace: "CreditPages.common" });
  const services = await getTranslations({ locale, namespace: "HomeBroker.services" });
  const points = t.raw("points") as Point[];
  const faq = t.raw("faq") as Faq[];
  const url = `${SITE_URL}${creditPagePath(pageKey, locale)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: t("h1"),
        description: t("metaDescription"),
        url,
        inLanguage: locale,
        provider: { "@type": ["Organization", "FinancialService"], name: "Lentific", url: SITE_URL },
      },
      {
        "@type": "FAQPage",
        inLanguage: locale,
        mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Lentific", item: `${SITE_URL}/${locale}` },
          { "@type": "ListItem", position: 2, name: services(`${pageKey}.title`), item: url },
        ],
      },
    ],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        // Textes du site sérialisés en JSON, aucune saisie utilisateur.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <section className="relative overflow-hidden bg-gradient-to-b from-brand to-brand-ink px-6 py-14 text-white sm:px-12 sm:py-20">
        <div className="relative mx-auto max-w-3xl">
          <nav aria-label="breadcrumb" className="mb-4 font-mono text-xs uppercase tracking-widest text-white/70">
            <a href={`/${locale}`} className="hover:text-white">Lentific</a> / {services(`${pageKey}.title`)}
          </nav>
          <h1 className="font-display text-3xl font-semibold text-balance sm:text-5xl">{t("h1")}</h1>
          <p className="mt-4 max-w-2xl text-white/85">{t("intro")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="light" href={`/${locale}#contact`}>{c("ctaButton")}</Button>
            <Button variant="ghost" href={pageKey === "crowd" ? "/marketplace" : "/simulateur"} className="border-white/30 text-white hover:bg-white/10">
              {pageKey === "crowd" ? services("crowd.cta") : c("simulator")}
            </Button>
          </div>
        </div>
      </section>

      <section className="px-6 py-14 sm:px-12">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{c("eyebrow")}</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-ink">{c("pointsTitle")}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {points.map((p) => (
              <div key={p.t} className="rounded-2xl border border-line bg-surface p-5">
                <h3 className="font-display text-lg text-ink">{p.t}</h3>
                <p className="mt-1.5 text-sm text-ink-soft">{p.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-alt px-6 py-14 sm:px-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-2xl font-semibold text-ink">{c("faqTitle")}</h2>
          <div className="mt-6 grid gap-3">
            {faq.map((f) => (
              <details key={f.q} className="rounded-xl border border-line bg-white p-4">
                <summary className="cursor-pointer font-semibold text-ink">{f.q}</summary>
                <p className="mt-2 text-sm text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-14 sm:px-12">
        <div className="mx-auto max-w-3xl rounded-2xl bg-brand p-8 text-white">
          <h2 className="font-display text-2xl font-semibold">{c("ctaTitle")}</h2>
          <p className="mt-2 text-white/85">{c("ctaText")}</p>
          <div className="mt-5">
            <Button variant="light" href={`/${locale}#contact`}>{c("ctaButton")}</Button>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-3xl">
          <h2 className="font-display text-lg text-ink">{c("otherServices")}</h2>
          <ul className="mt-3 flex flex-wrap gap-3 text-sm">
            {CREDIT_PAGE_KEYS.filter((k) => k !== pageKey).map((k) => (
              <li key={k}>
                <a href={creditPagePath(k, locale)} className="rounded-full border border-line px-3 py-1.5 text-brand-ink hover:border-brand">
                  {services(`${k}.title`)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
