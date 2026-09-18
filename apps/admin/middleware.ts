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
const PUBLIC_PREFIXES = ["/login", "/admin-access"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);
  const isPublic = PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
