"use client";

import { useEffect, useRef } from "react";

/** Fait défiler la page jusqu'à cet endroit au chargement (retour d'un formulaire). */
export function ScrollToHere() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ block: "center" });
  }, []);
  return <span ref={ref} aria-hidden />;
}
