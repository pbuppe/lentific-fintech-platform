import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { completePremiumCheckout, premiumTierFor } from "@fintech/payments";
import { premiumPath } from "../../../../../lib/premiumPath";
import { getCurrentUser } from "../../../../../lib/session";

/** Retour de PayPal après approbation de l'abonnement Premium (PayPal ajoute ?subscription_id=I-…). */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  const to = (query: string) => NextResponse.redirect(new URL(`${premiumPath(user.role)}?premium=${query}`, request.url));
  const subscriptionId = request.nextUrl.searchParams.get("subscription_id");
  if (!subscriptionId) return to("failed");
  try {
    const result = await completePremiumCheckout(subscriptionId, user.id, premiumTierFor(user.role));
    if (!result.ok) return to("failed");
    revalidatePath("/", "layout");
    return to(result.deferred ? "deferred" : "active");
  } catch (error) {
    console.error("[paypal] échec au retour d'abonnement", error);
    return to("failed");
  }
}
