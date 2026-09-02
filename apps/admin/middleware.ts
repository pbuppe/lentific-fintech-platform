import { NextResponse, type NextRequest } from "next/server";

/**
 * Garde d'accès légère au back-office : vérifie juste la présence du cookie
 * de session (le middleware Next.js tourne en Edge runtime, sans accès à
 * Prisma/Node : la vraie vérification du jeton et du rôle se fait ensuite
 * dans app/(protected)/layout.tsx, qui tourne côté serveur Node classique).
 */
const SESSION_COOKIE_NAME = "lentific_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);

  if (!hasSession && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
