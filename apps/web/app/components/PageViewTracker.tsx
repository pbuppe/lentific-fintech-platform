"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const VISITOR_COOKIE_NAME = "NEXT_VISITOR_ID";
const SESSION_COOKIE = "NEXT_VISIT_ID";
const SESSION_IDLE_SECONDS = 30 * 60; // une visite se termine après 30 min sans activité (comme Matomo)

function readCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? match[1] : null;
}

/**
 * Identifiant anonyme persistant côté navigateur, distinct du cookie de
 * session de connexion (jamais lié à un compte) : seul moyen de compter des
 * "visiteurs uniques" plutôt que des pages vues (§ demande produit 2026-09-18).
 */
function getOrCreateVisitorId(): string {
  const existing = readCookie(VISITOR_COOKIE_NAME);
  if (existing) return existing;
  const id = crypto.randomUUID();
  document.cookie = `${VISITOR_COOKIE_NAME}=${id}; path=/; max-age=63072000; samesite=lax`; // 2 ans
  return id;
}

/** Identifiant de la visite en cours, prolongé à chaque activité. */
function touchSessionId(): string {
  const id = readCookie(SESSION_COOKIE) ?? crypto.randomUUID();
  document.cookie = `${SESSION_COOKIE}=${id}; path=/; max-age=${SESSION_IDLE_SECONDS}; samesite=lax`;
  return id;
}

function send(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon && navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }))) return;
    fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
  } catch {
    // une mesure perdue n'est jamais grave, on ne relance pas
  }
}

/** Libellé lisible d'un élément cliqué : data-track, aria-label ou texte visible. */
function labelOf(el: Element) {
  const explicit = el.getAttribute("data-track") || el.getAttribute("aria-label") || el.getAttribute("title");
  const text = explicit || (el as HTMLElement).innerText || (el as HTMLInputElement).value || "";
  return text.replace(/\s+/g, " ").trim().slice(0, 120);
}

/**
 * Suivi des visites façon Matomo, auto-hébergé (demandes produit 2026-09-18 et
 * 2026-11-15) : chaque page vue (y compris les navigations internes), le temps
 * passé sur chaque page, les clics sur les boutons et liens, les envois de
 * formulaires (jamais leur contenu) et les liens sortants. Monté une seule
 * fois dans app/layout.tsx, ne rend rien à l'écran.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const current = useRef<{ id: string; path: string; visible: number; since: number | null } | null>(null);

  // Temps réellement passé sur la page (onglet visible), envoyé régulièrement et en quittant.
  const flush = () => {
    const c = current.current;
    if (!c) return;
    const ms = c.visible + (c.since ? Date.now() - c.since : 0);
    if (ms > 500) send({ t: "ping", id: c.id, ms, visitorId: getOrCreateVisitorId() });
  };

  useEffect(() => {
    if (!pathname || current.current?.path === pathname) return;
    flush();
    const visitorId = getOrCreateVisitorId();
    const sessionId = touchSessionId();
    const id = crypto.randomUUID();
    current.current = { id, path: pathname, visible: 0, since: document.visibilityState === "visible" ? Date.now() : null };
    const params = new URLSearchParams(window.location.search);
    send({
      t: "pv",
      id,
      path: pathname,
      referrer: document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : undefined,
      utm: params.get("utm_source") ?? undefined,
      sw: window.screen?.width,
      visitorId,
      sessionId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const onVisibility = () => {
      const c = current.current;
      if (!c) return;
      if (document.visibilityState === "hidden") {
        if (c.since) c.visible += Date.now() - c.since;
        c.since = null;
        flush();
      } else {
        c.since = Date.now();
        touchSessionId();
      }
    };
    const heartbeat = window.setInterval(() => {
      if (document.visibilityState === "visible") flush();
    }, 15000);

    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("a, button, [role=button], [data-track], input[type=submit]");
      if (!el || !current.current) return;
      // Bouton d'envoi d'un formulaire : compté par l'événement « submit » ci-dessous.
      if ((el as HTMLButtonElement).type === "submit" && el.closest("form")) return;
      const label = labelOf(el);
      if (!label) return;
      let kind = "click";
      let target: string | undefined;
      if (el.tagName === "A") {
        const href = (el as HTMLAnchorElement).href;
        target = href;
        if (href && !href.startsWith(window.location.origin) && /^https?:/.test(href)) kind = "outbound";
        else if (/\.(pdf|docx?|xlsx?|zip)(\?|$)/i.test(href)) kind = "download";
      }
      send({ t: "ev", kind, label, target, path: current.current.path, pageViewId: current.current.id, visitorId: getOrCreateVisitorId(), sessionId: touchSessionId() });
    };
    const onSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement | null;
      if (!form || !current.current) return;
      const submitter = e.submitter ? labelOf(e.submitter) : "";
      const label = form.getAttribute("data-track") || form.getAttribute("aria-label") || submitter || form.id || "formulaire";
      send({ t: "ev", kind: "submit", label: label.slice(0, 120), path: current.current.path, pageViewId: current.current.id, visitorId: getOrCreateVisitorId(), sessionId: touchSessionId() });
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      window.clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
