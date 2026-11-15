import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { notificationsRepo } from "@fintech/database";
import { completePaypalCheckout, applyPriority } from "@fintech/payments";
import { markBrokerFeePaid, DisbursementError } from "@fintech/applications";
import { getCurrentUser } from "../../../../lib/session";
import { safeBack } from "../../../../lib/paypalCheckout";

/**
 * Retour de PayPal après approbation : PayPal ajoute ?token=<id de commande>.
 * On capture (c'est là que l'argent est réellement prélevé), on vérifie montant
 * et propriétaire, puis on applique l'effet du paiement.
 */
export async function GET(request: NextRequest) {
  const back = safeBack(request.nextUrl.searchParams.get("back"));
  const orderId = request.nextUrl.searchParams.get("token");
  const to = (query: string) => NextResponse.redirect(new URL(`${back}?${query}`, request.url));

  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  if (!orderId) return to("payment=failed");

  try {
    const result = await completePaypalCheckout(orderId, user.id);
    if (!result.ok) return to(result.reason === "captured_needs_review" ? "payment=review" : "payment=failed");
    if (result.purpose === "broker_fee") {
      try {
        await markBrokerFeePaid(result.targetId, user.id, result.paymentId);
      } catch (error) {
        // Déjà marqué payé (page de retour rechargée) : rien à refaire.
        if (!(error instanceof DisbursementError)) throw error;
      }
      await notificationsRepo.markAllRead(user.id, "payment");
    } else if (result.purpose === "priority" && result.firstTime) {
      await applyPriority(result.targetId);
    }
    revalidatePath("/", "layout");
    return to(result.purpose === "priority" ? "priority=1" : "paid=1");
  } catch (error) {
    console.error("[paypal] échec au retour de paiement", error);
    return to("payment=failed");
  }
}
