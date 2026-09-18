import type { Locale } from "./locales";

/**
 * Deuxième segment de l'URL des pages de destination (§ demande produit
 * 2026-09-18) : /fr/bienvenue, /en/welcome, /de/willkommen... Le thème du
 * lien doit lui-même être traduit, pas rester un mot générique identique
 * dans les 8 langues, pour qu'un lien de campagne se lise naturellement dans
 * sa langue. app/[locale]/[slug]/page.tsx vérifie que le slug fourni
 * correspond bien à celui attendu pour la langue demandée (sinon 404) :
 * /en/bienvenue ou /fr/welcome ne doivent pas fonctionner.
 */
export const LOCALE_TO_SLUG: Record<Locale, string> = {
  fr: "bienvenue",
  en: "welcome",
  es: "bienvenida",
  it: "benvenuto",
  hu: "udvozlunk",
  pt: "bem-vindo",
  de: "willkommen",
  nl: "welkom",
};
