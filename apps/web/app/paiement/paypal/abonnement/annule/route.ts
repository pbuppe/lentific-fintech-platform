import { NextResponse, type NextRequest } from "next/server";
import { cancelPremiumCheckout } from "@fintech/payments";
import { getCurrentUser } from "../../../../../lib/session";
import { premiumPath } from "../../../../../lib/premiumPath";

/** Le client a annulé l'abonnement sur la page PayPal : rien n'a été prélevé. */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  await cancelPremiumCheckout(user.id);
  return NextResponse.redirect(new URL(`${premiumPath(user.role)}?premium=checkout_cancelled`, request.url));
}
