"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Signal de visite basique, envoyé à /api/track à chaque page vue, y compris
 * les navigations internes (le layout racine ne se re-rend pas au clic sur
 * un lien côté client, seul ce composant le voit passer via usePathname) :
 * remplaçant Matomo auto-hébergé en attendant un compte Matomo Cloud ou un
 * hébergement PHP dédié (§ demande produit 2026-09-18). Monté une seule fois
 * dans app/layout.tsx, ne rend rien à l'écran.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastSent.current === pathname) return;
    lastSent.current = pathname;

    const body = JSON.stringify({ path: pathname, referrer: document.referrer || undefined });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
      }
    } catch {
      // une visite non comptée n'est jamais grave, on ne relance pas
    }
  }, [pathname]);

  return null;
}
