import { NextResponse, type NextRequest } from "next/server";
import { unsubscribeMarketingContact } from "@fintech/auth";

/**
 * Désinscription « en un clic » des e-mails marketing (RFC 8058) : Gmail,
 * Outlook… envoient un POST sur l'adresse de l'en-tête List-Unsubscribe.
 * Un GET (lien ouvert à la main) renvoie vers la page de confirmation.
 */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  await unsubscribeMarketingContact(request.nextUrl.searchParams.get("t"));
  return new NextResponse(null, { status: 200 });
}

export async function GET(request: NextRequest) {
  const t = request.nextUrl.searchParams.get("t") ?? "";
  return NextResponse.redirect(new URL(`/desabonnement?t=${encodeURIComponent(t)}`, request.url));
}
