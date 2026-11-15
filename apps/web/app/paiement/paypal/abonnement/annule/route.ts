import { NextResponse, type NextRequest } from "next/server";
import { cancelPremiumCheckout } from "@fintech/payments";
import { getCurrentUser } from "../../../../../lib/session";

/** Le client a annulé l'abonnement sur la page PayPal : rien n'a été prélevé. */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  await cancelPremiumCheckout(user.id);
  return NextResponse.redirect(new URL("/investor/premium?premium=checkout_cancelled", request.url));
}
