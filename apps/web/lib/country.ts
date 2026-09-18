import { cookies, headers } from "next/headers";
import { SUPPORTED_COUNTRIES, LOCALE_TO_COUNTRY, type CountryCode } from "../i18n/countries";
import { pickLocaleFromAcceptLanguage } from "../i18n/detect";

export const COUNTRY_COOKIE_NAME = "NEXT_COUNTRY";
export const INTERNATIONAL_VALUE = "ALL";

/**
 * Pays utilisé pour filtrer la marketplace en priorité (§ demande produit
 * 2026-09-17). Résolution, dans l'ordre :
 *  1. Cookie NEXT_COUNTRY si l'utilisateur a explicitement choisi un pays
 *     (ou "ALL" pour la vue internationale) via le sélecteur.
 *  2. Sinon, pays déduit de la langue du navigateur (même signal que la
 *     langue par défaut de l'interface, voir i18n/request.ts).
 * Retourne null pour la vue internationale (aucun filtre à appliquer).
 */
export function getPreferredCountry(): CountryCode | null {
  const cookieValue = cookies().get(COUNTRY_COOKIE_NAME)?.value;
  if (cookieValue === INTERNATIONAL_VALUE) return null;
  if (cookieValue && SUPPORTED_COUNTRIES.includes(cookieValue as CountryCode)) {
    return cookieValue as CountryCode;
  }

  const locale = pickLocaleFromAcceptLanguage(headers().get("accept-language"));
  return LOCALE_TO_COUNTRY[locale];
}
