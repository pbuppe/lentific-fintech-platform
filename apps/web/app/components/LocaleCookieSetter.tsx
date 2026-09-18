"use client";

import { useEffect } from "react";

/**
 * Posé sur les pages de destination par langue (§ demande produit 2026-09-18) :
 * un visiteur arrivant depuis une campagne en allemand doit continuer en
 * allemand une fois qu'il clique vers /signup, /marketplace ou /login, pas
 * retomber sur la langue déduite de son navigateur.
 */
export function LocaleCookieSetter({ locale, country }: { locale: string; country: string }) {
  useEffect(() => {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    document.cookie = `NEXT_COUNTRY=${country}; path=/; max-age=31536000`;
  }, [locale, country]);

  return null;
}
