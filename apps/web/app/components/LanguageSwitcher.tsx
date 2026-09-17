"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { SUPPORTED_LOCALES, LOCALE_LABELS } from "../../i18n/locales";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  function onChange(next: string) {
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000`;
    router.refresh();
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
