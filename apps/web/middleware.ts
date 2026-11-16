import { NextResponse, type NextRequest } from "next/server";

/**
 * §37-39 (langue/pays) : le routage réel se fait par cookie (voir
 * i18n/request.ts et lib/country.ts), pas par sous-domaine (choix produit du
 * 2026-09-17). Ce middleware a un seul rôle i18n désormais : quand l'URL est
 * une page de destination par langue (/fr/bienvenue, /de/willkommen...),
 * forcer cette langue pour TOUTE la requête, y compris le layout racine
 * (balise <html lang>, en-tête du site), pas seulement le contenu de la page
 * elle-même, sinon un visiteur avec un navigateur en français qui clique une
 * pub en hongrois verrait un <html lang="fr"> et un menu en français
 * au-dessus d'une page en hongrois (§ demande produit 2026-09-18). Le
 * deuxième segment n'est pas vérifié ici (app/[locale]/[slug]/page.tsx s'en
 * charge et 404 si le slug ne correspond pas à la langue), un simple
 * `/fr/xxx` suffit à déclencher la préférence de langue côté middleware.
 */
const SESSION_COOKIE_NAME = "lentific_session";
const PROTECTED_PREFIXES = ["/dashboard", "/investor"];
// /fr, /de… (accueil par langue, indexable) et /fr/xxx (pages par langue : destination, types de crédit).
const LOCALE_LANDING_PAGE = /^\/(fr|en|es|it|hu|pt|de|nl)(?:\/[^/]+)?\/?$/;
const SUPPORTED = ["fr", "en", "es", "it", "hu", "pt", "de", "nl"];
const ONE_YEAR = 60 * 60 * 24 * 365;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Garde légère (Edge, pas de Prisma ici) : la vraie vérification du jeton
  // et du rôle se fait dans chaque page protégée (ex. (borrower)/dashboard).
  // Lien envoyé par e-mail (?lang=xx, voir webUrlInLocale dans packages/auth) :
  // la page s'affiche dans la langue du client, et la suite de sa visite aussi.
  const langParam = request.nextUrl.searchParams.get("lang");
  const linkLocale = langParam && SUPPORTED.includes(langParam) ? langParam : null;

  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) && !request.cookies.has(SESSION_COOKIE_NAME)) {
    const login = new URL("/login", request.url);
    if (linkLocale) login.searchParams.set("lang", linkLocale);
    return NextResponse.redirect(login);
  }

  if (linkLocale) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-forced-locale", linkLocale);
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.cookies.set("NEXT_LOCALE", linkLocale, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
    return response;
  }

  const localeMatch = pathname.match(LOCALE_LANDING_PAGE);
  if (!localeMatch) return NextResponse.next();

  // response.headers.set() ne serait vu que par le navigateur, pas par
  // headers() côté serveur : il faut le poser sur la requête transmise en
  // aval pour que i18n/request.ts (et donc tout composant serveur) le lise.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-forced-locale", localeMatch[1]);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
