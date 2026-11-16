import type { Locale } from "./locales";

import { WORLD_COUNTRIES } from "./worldCountries";

// Tous les pays proposés (2026-11-16 : monde entier sauf Afrique), voir worldCountries.ts.
export const SUPPORTED_COUNTRIES = WORLD_COUNTRIES;
// Pays des 8 langues du site, affichés en tête du choix de pays.
export const PRIMARY_COUNTRIES = ["FR", "GB", "ES", "IT", "HU", "PT", "DE", "NL"] as const;
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
