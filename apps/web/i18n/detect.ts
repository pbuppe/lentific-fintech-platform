import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from "./locales";

/**
 * Analyse l'en-tête Accept-Language (ex. "hu-HU,hu;q=0.9,en;q=0.8") et
 * retourne la première langue prise en charge par la plateforme, par ordre
 * de préférence du navigateur. Utilisé uniquement en l'absence de cookie
 * NEXT_LOCALE (§ demande produit 2026-09-17 : la langue du navigateur décide
 * de la langue par défaut au premier passage, pas à chaque visite).
 */
export function pickLocaleFromAcceptLanguage(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;

  const preferences = header
    .split(",")
    .map((part) => {
      const [tag, qPart] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: qPart ? parseFloat(qPart) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of preferences) {
    const base = tag.split("-")[0] as Locale;
    if (SUPPORTED_LOCALES.includes(base)) return base;
  }

  return DEFAULT_LOCALE;
}
