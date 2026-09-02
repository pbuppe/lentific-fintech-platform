import { NextResponse, type NextRequest } from "next/server";

/**
 * Résolution sous-domaine → locale (§37). Fallback path-based en développement
 * local (pas de sous-domaines sur localhost), voir arborescence §03,
 * [locale]/ reste le segment de routage réel une fois déployé.
 */
const SESSION_COOKIE_NAME = "lentific_session";
const PROTECTED_PREFIXES = ["/dashboard", "/investor"];

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const subdomain = host.split(".")[0];
  const { pathname } = request.nextUrl;

  const knownSubdomains: Record<string, string> = {
    fr: "fr-FR",
    en: "en-US",
    es: "es-ES",
  };

  // Garde légère (Edge, pas de Prisma ici) : la vraie vérification du jeton
  // et du rôle se fait dans chaque page protégée (ex. (borrower)/dashboard).
  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) && !request.cookies.has(SESSION_COOKIE_NAME)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const locale = knownSubdomains[subdomain] ?? "fr-FR";
  const response = NextResponse.next();
  response.headers.set("x-locale", locale);
  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
