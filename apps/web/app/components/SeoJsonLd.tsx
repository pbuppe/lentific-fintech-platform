import { getLocale, getTranslations } from "next-intl/server";
import { legalIdentity } from "../../lib/legal";
import { SITE_URL } from "../../lib/seo";
import { LOCALE_TO_COUNTRY } from "../../i18n/countries";

/**
 * Données structurées schema.org (SEO, 2026-11-16) : Google comprend qui est
 * Lentific (service financier, société exploitante, contact, logo) et peut
 * afficher la FAQ directement dans ses résultats, dans la langue de la page.
 */
const FAQ_KEYS = ["cost", "individuals", "documents", "delay", "remote"] as const;

export async function SeoJsonLd() {
  const locale = await getLocale();
  const t = await getTranslations("Seo");
  const faq = await getTranslations("HomeBroker.faq");
  const id = legalIdentity();

  const graph = [
    {
      "@type": ["Organization", "FinancialService"],
      "@id": `${SITE_URL}/#organization`,
      name: "Lentific",
      legalName: id.company,
      url: SITE_URL,
      logo: `${SITE_URL}/email/lentific-logo.png`,
      image: `${SITE_URL}/opengraph-image.png`,
      email: id.email,
      ...(id.phone ? { telephone: id.phone } : {}),
      description: t("homeDescription"),
      address: { "@type": "PostalAddress", streetAddress: "49 Heol Cae-Rhys", addressLocality: "Cardiff", postalCode: "CF14 6AP", addressCountry: "GB" },
      areaServed: Object.values(LOCALE_TO_COUNTRY).map((c) => ({ "@type": "Country", name: c })),
      availableLanguage: ["fr", "en", "es", "it", "hu", "pt", "de", "nl"],
      knowsAbout: t("keywords").split(",").map((k) => k.trim()),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Lentific",
      inLanguage: locale,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "FAQPage",
      inLanguage: locale,
      mainEntity: FAQ_KEYS.map((k) => ({
        "@type": "Question",
        name: faq(`${k}.q`),
        acceptedAnswer: { "@type": "Answer", text: faq(`${k}.a`) },
      })),
    },
  ];

  return (
    <script
      type="application/ld+json"
      // Contenu produit par nous (textes du site), sérialisé en JSON : pas d'entrée utilisateur.
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c") }}
    />
  );
}
