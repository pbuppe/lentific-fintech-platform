import { NextResponse, type NextRequest } from "next/server";
import { prisma, pageViewsRepo } from "@fintech/database";
import { getSessionUser, SESSION_COOKIE_NAME } from "@fintech/auth";

/**
 * Collecte du suivi des visites (PageViewTracker.tsx), façon Matomo
 * (demandes produit 2026-09-18 puis 2026-11-15) :
 *  - "pv"   : une page vue (avec visite, appareil, pays, ville, membre connecté) ;
 *  - "ping" : temps passé sur la page (envoyé régulièrement et en quittant) ;
 *  - "ev"   : une action (clic sur un bouton ou un lien, envoi de formulaire,
 *             lien sortant). Jamais le contenu saisi dans les formulaires.
 * Ne renvoie jamais d'erreur bruyante : les statistiques ne doivent jamais
 * gêner la navigation. Aucune adresse IP n'est enregistrée.
 */
const ID_RE = /^[0-9a-z-]{16,40}$/i;
const BOT_RE = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python|axios|node-fetch|vercel/i;

const id = (v: unknown) => (typeof v === "string" && ID_RE.test(v) ? v : undefined);
const str = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);

/** Appareil, système et navigateur déduits de l'en-tête User-Agent. */
function parseUserAgent(ua: string) {
  let os: string | undefined;
  if (/iPhone|iPod/.test(ua)) os = "iOS";
  else if (/iPad/.test(ua) || (/Macintosh/.test(ua) && /Mobile\//.test(ua))) os = "iPadOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/CrOS/.test(ua)) os = "ChromeOS";
  else if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac OS X|Macintosh/.test(ua)) os = "macOS";
  else if (/Linux/.test(ua)) os = "Linux";

  let deviceType = "desktop";
  if (os === "iOS" || (os === "Android" && /Mobile/.test(ua)) || /Mobi|Windows Phone/.test(ua)) deviceType = "mobile";
  else if (os === "iPadOS" || os === "Android" || /Tablet/.test(ua)) deviceType = "tablet";

  let browser: string | undefined;
  if (/SamsungBrowser/.test(ua)) browser = "Samsung Internet";
  else if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/.test(ua)) browser = "Opera";
  else if (/Firefox|FxiOS/.test(ua)) browser = "Firefox";
  else if (/Chrome|CriOS/.test(ua)) browser = "Chrome";
  else if (/Safari/.test(ua)) browser = "Safari";
  return { os, deviceType, browser };
}

/** Pays « d'origine » : préférence du visiteur, sinon région de la langue de son navigateur (fr-BE → BE). */
function originCountry(request: NextRequest) {
  const cookie = request.cookies.get("NEXT_COUNTRY")?.value;
  if (cookie && /^[a-z]{2}$/i.test(cookie)) return cookie.toUpperCase();
  const lang = request.headers.get("accept-language") ?? "";
  const m = lang.match(/^[a-z]{2,3}-([A-Z]{2})\b/i);
  return m ? m[1].toUpperCase() : undefined;
}

function decodeHeader(v: string | null) {
  if (!v) return undefined;
  try {
    return decodeURIComponent(v).slice(0, 80);
  } catch {
    return v.slice(0, 80);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ua = request.headers.get("user-agent") ?? "";
    if (BOT_RE.test(ua)) return NextResponse.json({ ok: true });
    const body = await request.json();
    const visitorId = id(body.visitorId);
    const sessionId = id(body.sessionId);
    const type = body.t ?? "pv";

    if (type === "ping") {
      const pageViewId = id(body.id);
      const ms = Number(body.ms);
      if (pageViewId && Number.isFinite(ms) && ms > 0) {
        // Plafond à 30 min par page : un onglet oublié ne fausse pas les moyennes.
        // Visite anonyme (sans consentement) : seule une page sans identifiant peut être mise à jour.
        await prisma.pageView.updateMany({ where: { id: pageViewId, visitorId: visitorId ?? null }, data: { durationMs: Math.min(Math.round(ms), 30 * 60 * 1000) } });
      }
      return NextResponse.json({ ok: true });
    }

    if (type === "ev") {
      if (!visitorId) return NextResponse.json({ ok: true }); // actions : uniquement avec consentement
      const kind = ["click", "submit", "outbound", "download"].includes(body.kind) ? body.kind : null;
      const label = str(body.label, 120);
      const path = str(body.path, 500);
      if (kind && label && path) {
        await prisma.trackEvent.create({
          data: { kind, label, path, target: str(body.target, 300), visitorId, sessionId, pageViewId: id(body.pageViewId) },
        });
      }
      return NextResponse.json({ ok: true });
    }

    const path = str(body.path, 500);
    if (!path) return NextResponse.json({ ok: false }, { status: 400 });
    const { os, deviceType, browser } = parseUserAgent(ua);
    // Membre connecté : seulement si le visiteur a accepté la mesure d'audience.
    const user = body.c !== 1 ? null : await getSessionUser(request.cookies.get(SESSION_COOKIE_NAME)?.value).catch(() => null);
    const sw = Number(body.sw);

    await pageViewsRepo.record({
      id: id(body.id),
      path,
      locale: request.cookies.get("NEXT_LOCALE")?.value,
      countryCode: originCountry(request),
      // Détection réseau par Vercel (absente en local, c'est attendu).
      geoCountryCode: request.headers.get("x-vercel-ip-country") ?? undefined,
      city: decodeHeader(request.headers.get("x-vercel-ip-city")),
      region: decodeHeader(request.headers.get("x-vercel-ip-country-region")),
      referrer: str(body.referrer, 500),
      utmSource: str(body.utm, 80),
      visitorId,
      sessionId,
      os,
      deviceType,
      browser,
      screenWidth: Number.isFinite(sw) && sw > 0 && sw < 10000 ? Math.round(sw) : undefined,
      userId: user?.id,
    });
  } catch {
    // silencieux volontairement, voir commentaire ci-dessus
  }
  return NextResponse.json({ ok: true });
}
