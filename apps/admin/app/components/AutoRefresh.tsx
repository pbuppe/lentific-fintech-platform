"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Rafraîchit périodiquement la page serveur (§ demande produit 2026-09-18 :
 * "connectées depuis les 30 dernières minutes" doit rester à peu près à
 * jour). Pas un vrai flux temps réel (pas de websocket), un intervalle
 * suffit pour un compteur qui n'a pas besoin de la seconde près.
 */
export function AutoRefresh({ intervalSeconds }: { intervalSeconds: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalSeconds * 1000);
    return () => clearInterval(id);
  }, [router, intervalSeconds]);

  return null;
}
