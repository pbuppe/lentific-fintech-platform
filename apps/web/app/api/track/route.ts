import { NextResponse, type NextRequest } from "next/server";
import { pageViewsRepo } from "@fintech/database";

/**
 * Reçoit un signal de visite envoyé par PageViewTracker.tsx à chaque
 * changement de page (§ demande produit 2026-09-18, onglet Statistiques,
 * en attendant un vrai Matomo). Ne renvoie jamais d'erreur bruyante côté
 * visiteur : un échec d'écriture des statistiques ne doit jamais gêner la
 * navigation normale.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const path = typeof body.path === "string" ? body.path.slice(0, 500) : "";
    if (!path) return NextResponse.json({ ok: false }, { status: 400 });

    await pageViewsRepo.record({
      path,
      locale: request.cookies.get("NEXT_LOCALE")?.value,
      countryCode: request.cookies.get("NEXT_COUNTRY")?.value,
      referrer: typeof body.referrer === "string" ? body.referrer.slice(0, 500) : undefined,
    });
  } catch {
    // silencieux volontairement, voir commentaire ci-dessus
  }
  return NextResponse.json({ ok: true });
}
