/**
 * Référencement (demande produit 2026-11-16 : « que le site soit découvert
 * facilement sur Google, dans toutes les langues »).
 *
 * Principe : chaque langue a sa propre adresse indexable (/fr, /en, /de…),
 * reliée aux autres par des balises hreflang, et « / » reste la version par
 * défaut (x-default) qui suit la langue du visiteur. Google voit ainsi les
 * 8 versions du site au lieu d'une seule.
 */
import type { Metadata } from "next";
import { SUPPORTED_LOCALES, type Locale } from "../i18n/locales";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.lentific.com").replace(/\/$/, "");

/** Image d'aperçu des partages (app/opengraph-image.png, 1200 × 630). */
export const OG_IMAGE = `${SITE_URL}/opengraph-image.png`;

/** Code de langue + pays principal, pour Open Graph (og:locale). */
export const OG_LOCALE: Record<Locale, string> = {
  fr: "fr_FR",
  en: "en_GB",
  es: "es_ES",
  it: "it_IT",
  hu: "hu_HU",
  pt: "pt_PT",
  de: "de_DE",
  nl: "nl_NL",
};

/**
 * Balises hreflang : `pathFor(locale)` donne l'adresse de la page dans chaque
 * langue ; `xDefault` est l'adresse neutre (par défaut « / »).
 */
export function languageAlternates(pathFor: (locale: Locale) => string, xDefault?: string) {
  const languages: Record<string, string> = {};
  for (const l of SUPPORTED_LOCALES) languages[l] = `${SITE_URL}${pathFor(l)}`;
  if (xDefault) languages["x-default"] = `${SITE_URL}${xDefault}`;
  return languages;
}

/** Métadonnées complètes d'une page publique dans une langue donnée. */
export function pageMetadata(input: {
  locale: Locale;
  title: string;
  description: string;
  path: string;
  pathFor?: (locale: Locale) => string;
  xDefault?: string;
  keywords?: string;
}): Metadata {
  const url = `${SITE_URL}${input.path}`;
  const title = `${input.title} | Lentific`;
  return {
    title,
    description: input.description,
    keywords: input.keywords,
    alternates: {
      canonical: url,
      languages: input.pathFor ? languageAlternates(input.pathFor, input.xDefault) : undefined,
    },
    openGraph: {
      type: "website",
      url,
      siteName: "Lentific",
      title,
      description: input.description,
      locale: OG_LOCALE[input.locale],
      alternateLocale: SUPPORTED_LOCALES.filter((l) => l !== input.locale).map((l) => OG_LOCALE[l]),
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Lentific" }],
    },
    twitter: { card: "summary_large_image", title, description: input.description, images: [OG_IMAGE] },
  };
}

/** Pages privées (espaces client, connexion, paiement) : jamais dans Google. */
export const NOINDEX: Metadata = { robots: { index: false, follow: false } };
