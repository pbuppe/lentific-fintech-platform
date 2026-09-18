"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const VISITOR_COOKIE_NAME = "NEXT_VISITOR_ID";

/**
 * Identifiant anonyme persistant côté navigateur, distinct du cookie de
 * session (jamais lié à un compte) : seul moyen de compter des "visiteurs
 * uniques" plutôt que des pages vues (§ demande produit 2026-09-18).
 */
function getOrCreateVisitorId(): string {
  const match = document.cookie.match(new RegExp(`${VISITOR_COOKIE_NAME}=([^;]+)`));
  if (match) return match[1];

  const id = crypto.randomUUID();
  document.cookie = `${VISITOR_COOKIE_NAME}=${id}; path=/; max-age=63072000`; // 2 ans
  return id;
}

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

    const visitorId = getOrCreateVisitorId();
    const body = JSON.stringify({ path: pathname, referrer: document.referrer || undefined, visitorId });
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
