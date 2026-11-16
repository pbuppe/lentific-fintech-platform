"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { SUPPORTED_COUNTRIES, PRIMARY_COUNTRIES, type CountryCode } from "../../i18n/countries";
import { CountryFlag } from "./CountryFlag";

const COOKIE_NAME = "NEXT_COUNTRY";
const INTERNATIONAL_VALUE = "ALL";

/**
 * Choix du pays de la marketplace (2026-11-16) : drapeau de chaque pays, noms
 * dans la langue du visiteur (traduits par le navigateur), recherche, et les
 * pays des 8 langues du site en tête de liste.
 */
export function CountryFilter({ current }: { current: CountryCode | null }) {
  const t = useTranslations("CountryFilter");
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const value = current ?? INTERNATIONAL_VALUE;

  const names = useMemo(() => {
    const display = new Intl.DisplayNames([locale], { type: "region" });
    return new Map<string, string>(SUPPORTED_COUNTRIES.map((c) => [c, display.of(c) ?? c]));
  }, [locale]);
  const label = (code: string) => (code === INTERNATIONAL_VALUE ? t("international") : names.get(code) ?? code);

  const others = useMemo(
    () =>
      SUPPORTED_COUNTRIES.filter((c) => !(PRIMARY_COUNTRIES as readonly string[]).includes(c)).sort((a, b) =>
        (names.get(a) ?? a).localeCompare(names.get(b) ?? b, locale)
      ),
    [names, locale]
  );
  const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const matches = (code: string) => !query || normalize(label(code)).includes(normalize(query)) || code.toLowerCase() === query.toLowerCase();

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(code: string) {
    document.cookie = `${COOKIE_NAME}=${code}; path=/; max-age=31536000`;
    setOpen(false);
    setQuery("");
    router.refresh();
  }

  const option = (code: string) =>
    matches(code) && (
      <li key={code} role="option" aria-selected={code === value}>
        <button
          type="button"
          onClick={() => choose(code)}
          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm ${
            code === value ? "bg-brand-soft font-semibold text-brand-ink" : "text-ink hover:bg-surface-alt"
          }`}
        >
          <CountryFlag code={code} size={20} />
          {label(code)}
        </button>
      </li>
    );

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        aria-label={t("label")}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink-soft hover:bg-surface-alt"
      >
        <CountryFlag code={value} size={18} />
        {label(value)}
        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-64 rounded-xl border border-line bg-white p-2 shadow-lg">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔍"
            aria-label={t("label")}
            className="mb-1 w-full rounded-lg border border-line px-2.5 py-1.5 text-sm text-ink"
          />
          <ul role="listbox" aria-label={t("label")} className="max-h-72 overflow-y-auto">
            {matches(INTERNATIONAL_VALUE) && option(INTERNATIONAL_VALUE)}
            {PRIMARY_COUNTRIES.map(option)}
            {!query && <li role="separator" className="my-1 border-t border-line" />}
            {others.map(option)}
          </ul>
        </div>
      )}
    </div>
  );
}
