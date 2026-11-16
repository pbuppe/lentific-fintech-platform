"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { SUPPORTED_LOCALES, LOCALE_LABELS, type Locale } from "../../i18n/locales";
import { LOCALE_TO_SLUG } from "../../i18n/slugs";
import { CREDIT_PAGE_KEYS, CREDIT_PAGE_SLUGS, creditPagePath } from "../../i18n/creditPages";
import { setPreferredLocale } from "../../lib/actions/setPreferredLocale";

/**
 * Sur une page à adresse par langue (/fr, /fr/credit-immobilier…), changer de
 * langue ouvre la même page dans l'autre langue (SEO, 2026-11-16) ; ailleurs,
 * la langue est mémorisée et la page se recharge comme avant.
 */
function localizedPath(pathname: string, from: Locale, to: Locale): string | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== from) return null;
  if (parts.length === 1) return `/${to}`;
  if (parts.length === 2) {
    if (parts[1] === LOCALE_TO_SLUG[from]) return `/${to}/${LOCALE_TO_SLUG[to]}`;
    const key = CREDIT_PAGE_KEYS.find((k) => CREDIT_PAGE_SLUGS[k][from] === parts[1]);
    if (key) return creditPagePath(key, to);
  }
  return null;
}

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function onChange(next: string) {
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000`;
    setPreferredLocale(next).catch(() => {});
    const target = localizedPath(pathname, locale, next as Locale);
    if (target) router.push(target);
    else router.refresh();
  }

  return (
    <select
      aria-label="Langue"
      value={locale}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-line bg-surface px-2 py-1.5 text-xs font-semibold text-ink-soft hover:bg-surface-alt"
    >
      {SUPPORTED_LOCALES.map((l) => (
        <option key={l} value={l}>
          {LOCALE_LABELS[l]}
        </option>
      ))}
    </select>
  );
}
