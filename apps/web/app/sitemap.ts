import type { MetadataRoute } from "next";
import { SUPPORTED_LOCALES, type Locale } from "../i18n/locales";
import { LOCALE_TO_SLUG } from "../i18n/slugs";
import { CREDIT_PAGE_KEYS, creditPagePath } from "../i18n/creditPages";
import { SITE_URL, languageAlternates } from "../lib/seo";

/**
 * Plan du site pour Google (SEO, 2026-11-16) : chaque page publique, dans
 * chacune des 8 langues, avec ses équivalents dans les autres langues.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entry = (path: string, pathFor: ((l: Locale) => string) | null, priority: number, changeFrequency: "daily" | "weekly" | "monthly" | "yearly") => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
    ...(pathFor ? { alternates: { languages: languageAlternates(pathFor, "/") } } : {}),
  });

  return [
    entry("/", (l) => `/${l}`, 1, "daily"),
    ...SUPPORTED_LOCALES.map((l) => entry(`/${l}`, (x) => `/${x}`, 0.9, "daily")),
    ...CREDIT_PAGE_KEYS.flatMap((k) => SUPPORTED_LOCALES.map((l) => entry(creditPagePath(k, l), (x) => creditPagePath(k, x), 0.8, "weekly"))),
    ...SUPPORTED_LOCALES.map((l) => entry(`/${l}/${LOCALE_TO_SLUG[l]}`, (x) => `/${x}/${LOCALE_TO_SLUG[x]}`, 0.6, "monthly")),
    entry("/simulateur", null, 0.7, "monthly"),
    entry("/marketplace", null, 0.7, "daily"),
    entry("/confidentialite", null, 0.2, "yearly"),
  ];
}
