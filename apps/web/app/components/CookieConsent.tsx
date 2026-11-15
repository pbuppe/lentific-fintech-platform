"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Bandeau de consentement aux cookies de mesure d'audience (demande produit
 * 2026-11-16). Deux boutons de même importance (Accepter / Refuser) ; le choix
 * est gardé 6 mois puis redemandé. Sans accord, PageViewTracker compte la
 * visite de façon anonyme (pays, ville approximative, appareil, page), sans
 * cookie ni parcours. « Gérer les cookies » (pied de page) rouvre le bandeau.
 */
export const CONSENT_COOKIE = "lentific_consent";
export const CONSENT_EVENT = "lentific:consent";
export const OPEN_SETTINGS_EVENT = "lentific:cookie-settings";
const SIX_MONTHS = 60 * 60 * 24 * 182;

export type Consent = "all" | "essential" | null;

export function readConsent(): Consent {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )lentific_consent=(all|essential)/);
  return (m?.[1] as Consent) ?? null;
}

function saveConsent(value: "all" | "essential") {
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${SIX_MONTHS}; samesite=lax`;
  if (value === "essential") {
    // Retrait de l'accord : on efface les identifiants de mesure d'audience.
    for (const name of ["NEXT_VISITOR_ID", "NEXT_VISIT_ID"]) document.cookie = `${name}=; path=/; max-age=0`;
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

export function CookieConsentBanner() {
  const t = useTranslations("CookieBanner");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!readConsent()) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, reopen);
  }, []);

  if (!open) return null;
  const choose = (v: "all" | "essential") => {
    saveConsent(v);
    setOpen(false);
  };

  return (
    <div role="dialog" aria-live="polite" aria-label={t("title")} className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div className="mx-auto max-w-3xl rounded-2xl border border-line bg-white p-4 shadow-xl sm:p-5">
        <p className="font-display text-base font-semibold text-ink">{t("title")}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{t("text")}</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => choose("essential")} className="rounded-lg border border-ink/20 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface-alt">
            {t("refuse")}
          </button>
          <button type="button" onClick={() => choose("all")} className="rounded-lg border border-ink/20 bg-yellow px-4 py-2.5 text-sm font-semibold text-ink hover:bg-yellow-ink">
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Lien « Gérer les cookies » du pied de page : rouvre le bandeau. */
export function CookieSettingsLink({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))} className="text-left hover:text-ink">
      {label}
    </button>
  );
}
