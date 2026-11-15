import { NextResponse, type NextRequest } from "next/server";

/**
 * Garde d'accès légère au back-office : vérifie juste la présence du cookie
 * de session (le middleware Next.js tourne en Edge runtime, sans accès à
 * Prisma/Node : la vraie vérification du jeton et du rôle se fait ensuite
 * dans app/(protected)/layout.tsx, qui tourne côté serveur Node classique).
 */
const SESSION_COOKIE_NAME = "lentific_session";
// /admin-access/[token] est volontairement accessible sans session (§ demande
// produit 2026-09-18, lien secret de création de compte) : sa propre
// protection est le jeton dans l'URL, vérifié à temps constant côté page,
// pas cette garde-ci qui exigerait déjà un compte pour en créer un.
// /activer/[token] : lien d invitation d un membre de l équipe (console super
// admin, 2026-11-14), protégé par son jeton à usage unique.
const PUBLIC_PREFIXES = ["/login", "/admin-access", "/activer", "/robots.txt"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);
  const isPublic = PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!hasSession && !isPublic) {
    const redirect = NextResponse.redirect(new URL("/login", request.url));
    redirect.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return redirect;
  }

  const response = NextResponse.next();
  // Back-office interne : jamais indexé ni suivi par les moteurs de recherche,
  // quelle que soit la page (en plus de robots.txt et des balises meta).
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
