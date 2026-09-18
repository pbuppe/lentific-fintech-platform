import type { Locale } from "./locales";

export const SUPPORTED_COUNTRIES = ["FR", "GB", "ES", "IT", "HU", "PT", "DE", "NL"] as const;
export type CountryCode = (typeof SUPPORTED_COUNTRIES)[number];

// Un pays "par défaut" par langue prise en charge, utilisé pour pré-remplir
// le filtre pays d'après la langue du navigateur au premier passage (§ demande
// produit 2026-09-17 : "dès qu'il entre ... ça affichera avant tout les
// offres en Hongrie"). Simplification assumée : une langue peut recouvrir
// plusieurs pays réels, on choisit ici le pays le plus représentatif de
// chaque langue prise en charge par la plateforme.
export const LOCALE_TO_COUNTRY: Record<Locale, CountryCode> = {
  fr: "FR",
  en: "GB",
  es: "ES",
  it: "IT",
  hu: "HU",
  pt: "PT",
  de: "DE",
  nl: "NL",
};

export const COUNTRY_FLAGS: Record<CountryCode, string> = {
  FR: "🇫🇷",
  GB: "🇬🇧",
  ES: "🇪🇸",
  IT: "🇮🇹",
  HU: "🇭🇺",
  PT: "🇵🇹",
  DE: "🇩🇪",
  NL: "🇳🇱",
};

export const COUNTRY_CURRENCY: Record<CountryCode, string> = {
  FR: "EUR",
  GB: "GBP",
  ES: "EUR",
  IT: "EUR",
  HU: "HUF",
  PT: "EUR",
  DE: "EUR",
  NL: "EUR",
};
