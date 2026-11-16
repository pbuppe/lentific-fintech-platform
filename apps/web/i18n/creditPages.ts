import type { Locale } from "./locales";

/**
 * Pages par type de crédit (SEO, demande produit 2026-11-16) : une page par
 * service du site et par langue, à une adresse traduite dans les mots que les
 * gens tapent dans Google (/fr/credit-immobilier, /de/baufinanzierung…).
 * Textes : messages/<langue>.json, espace « CreditPages ».
 */
export const CREDIT_PAGE_KEYS = ["mortgage", "consolidation", "works", "crowd"] as const;
export type CreditPageKey = (typeof CREDIT_PAGE_KEYS)[number];

export const CREDIT_PAGE_SLUGS: Record<CreditPageKey, Record<Locale, string>> = {
  mortgage: {
    fr: "credit-immobilier",
    en: "mortgage",
    es: "hipoteca",
    it: "mutuo-casa",
    hu: "lakashitel",
    pt: "credito-habitacao",
    de: "baufinanzierung",
    nl: "hypotheek",
  },
  consolidation: {
    fr: "regroupement-de-credits",
    en: "debt-consolidation",
    es: "reunificacion-de-deudas",
    it: "consolidamento-debiti",
    hu: "adossagrendezo-hitel",
    pt: "consolidacao-de-creditos",
    de: "umschuldung",
    nl: "leningen-samenvoegen",
  },
  works: {
    fr: "pret-travaux-pret-personnel",
    en: "personal-and-home-improvement-loans",
    es: "prestamo-personal-reformas",
    it: "prestito-personale-ristrutturazione",
    hu: "szemelyi-kolcson-felujitasi-hitel",
    pt: "credito-pessoal-obras",
    de: "privatkredit-modernisierungskredit",
    nl: "persoonlijke-lening-verbouwing",
  },
  crowd: {
    fr: "financement-participatif",
    en: "crowdlending",
    es: "financiacion-participativa",
    it: "finanziamento-partecipativo",
    hu: "kozossegi-finanszirozas",
    pt: "financiamento-colaborativo",
    de: "crowdlending",
    nl: "crowdfunding",
  },
};

export function creditPageFromSlug(locale: Locale, slug: string): CreditPageKey | null {
  return CREDIT_PAGE_KEYS.find((k) => CREDIT_PAGE_SLUGS[k][locale] === slug) ?? null;
}

export function creditPagePath(key: CreditPageKey, locale: Locale) {
  return `/${locale}/${CREDIT_PAGE_SLUGS[key][locale]}`;
}
