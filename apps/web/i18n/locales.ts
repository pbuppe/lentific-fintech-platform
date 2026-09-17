export const SUPPORTED_LOCALES = ["fr", "en", "es", "it", "hu", "pt"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  es: "Español",
  it: "Italiano",
  hu: "Magyar",
  pt: "Português",
};
