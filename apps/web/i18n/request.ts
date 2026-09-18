/**
 * Config next-intl (§37, §38, §39) : sélection de langue par cookie plutôt
 * que par sous-domaine (choix produit du 2026-09-17, remplace le prototype
 * de résolution par sous-domaine ébauché dans packages/localization, gardé
 * pour référence future mais non branché ici).
 *
 * Ordre de résolution :
 *  1. requestLocale explicite (ex. getTranslations({ locale: "de" }), utilisé
 *     par la page de destination elle-même dans app/[locale]/page.tsx).
 *  2. En-tête x-forced-locale posé par middleware.ts sur une URL de
 *     destination (/fr, /de...) : force TOUTE la requête dans cette langue,
 *     y compris le layout racine (balise <html lang>, en-tête du site),
 *     même si un cookie NEXT_LOCALE plus ancien dit autre chose (§ demande
 *     produit 2026-09-18 : un lien de campagne doit primer sur une
 *     préférence enregistrée lors d'une visite précédente).
 *  3. Cookie NEXT_LOCALE (choix explicite du visiteur via le sélecteur).
 *  4. Langue du navigateur (première visite, aucun cookie).
 */
import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { SUPPORTED_LOCALES, type Locale } from "./locales";
import { pickLocaleFromAcceptLanguage } from "./detect";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  if (requested && SUPPORTED_LOCALES.includes(requested as Locale)) {
    const locale = requested as Locale;
    return { locale, messages: (await import(`../messages/${locale}.json`)).default };
  }

  const forcedLocale = headers().get("x-forced-locale");
  if (forcedLocale && SUPPORTED_LOCALES.includes(forcedLocale as Locale)) {
    const locale = forcedLocale as Locale;
    return { locale, messages: (await import(`../messages/${locale}.json`)).default };
  }

  const cookieLocale = cookies().get("NEXT_LOCALE")?.value;
  const locale: Locale = SUPPORTED_LOCALES.includes(cookieLocale as Locale)
    ? (cookieLocale as Locale)
    : pickLocaleFromAcceptLanguage(headers().get("accept-language"));

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
