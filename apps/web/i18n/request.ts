/**
 * Config next-intl (§37, §38, §39) : sélection de langue par cookie plutôt
 * que par sous-domaine (choix produit du 2026-09-17, remplace le prototype
 * de résolution par sous-domaine ébauché dans middleware.ts et
 * packages/localization, gardé pour référence future mais non branché ici).
 */
import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from "./locales";

export default getRequestConfig(async () => {
  const cookieLocale = cookies().get("NEXT_LOCALE")?.value;
  const locale: Locale = SUPPORTED_LOCALES.includes(cookieLocale as Locale)
    ? (cookieLocale as Locale)
    : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
