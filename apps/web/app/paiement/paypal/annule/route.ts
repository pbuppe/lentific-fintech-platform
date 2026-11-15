import { NextResponse, type NextRequest } from "next/server";
import { cancelPaypalCheckout } from "@fintech/payments";
import { getCurrentUser } from "../../../../lib/session";
import { safeBack } from "../../../../lib/paypalCheckout";

/** Le client a cliqué « Annuler » sur la page PayPal : rien n'a été prélevé. */
export async function GET(request: NextRequest) {
  const back = safeBack(request.nextUrl.searchParams.get("back"));
  const orderId = request.nextUrl.searchParams.get("token");
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  if (orderId) await cancelPaypalCheckout(orderId, user.id);
  return NextResponse.redirect(new URL(`${back}?payment=cancelled`, request.url));
}
