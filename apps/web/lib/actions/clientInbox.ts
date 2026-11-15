"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { notificationsRepo } from "@fintech/database";
import { getPayableBrokerFee, markBrokerFeePaid, DisbursementError } from "@fintech/applications";
import { recordFee, isPaypalConfigured } from "@fintech/payments";
import { beginPaypalPayment } from "../paypalCheckout";
import { getCurrentUser } from "../session";

/** Préfixe des pages de l'espace selon le rôle (l'investisseur a ses pages sous /investor). */
export async function spaceBase(role: string) {
  return role === "INVESTOR" ? "/investor" : "";
}

/** Ouvre une notification : la marque comme lue puis emmène vers la page concernée. */
export async function openNotificationAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id"));
  const notification = await notificationsRepo.findForUser(id, user.id);
  if (!notification) redirect(`${await spaceBase(user.role)}/notifications`);
  await notificationsRepo.markRead(id, user.id);
  revalidatePath("/", "layout");
  // Seuls des chemins internes de l'espace client sont suivis.
  const link = notification.link && notification.link.startsWith("/") && !notification.link.startsWith("//") ? notification.link : "/notifications";
  const base = await spaceBase(user.role);
  redirect(link === "/paiements" || link.startsWith(base) ? link : `${base}${link}`);
}

export async function markAllNotificationsReadAction() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await notificationsRepo.markAllRead(user.id);
  revalidatePath("/", "layout");
}

/**
 * Règlement des honoraires de courtage : possible uniquement pour une demande
 * émise après la confirmation du versement des fonds et appartenant à
 * l'emprunteur connecté (vérifié par getPayableBrokerFee).
 */
export async function payBrokerFeeAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const feeId = String(formData.get("feeId"));
  const back = String(formData.get("back") ?? "/paiements") === "/dashboard" ? "/dashboard" : "/paiements";
  let paypalUrl: string | null = null;
  try {
    const fee = await getPayableBrokerFee(feeId, user.id);
    if (isPaypalConfigured()) {
      paypalUrl = await beginPaypalPayment({
        userId: user.id,
        amount: Number(fee.amount),
        currencyId: fee.application.currencyId,
        purpose: "broker_fee",
        targetId: fee.id,
        reference: fee.application.reference,
        back,
      });
    } else {
    const payment = await recordFee(user.id, Number(fee.amount), fee.application.currencyId);
    await markBrokerFeePaid(fee.id, user.id, payment.id);
    await notificationsRepo.markAllRead(user.id, "payment");
    }
  } catch (error) {
    if (error instanceof DisbursementError) redirect(back);
    console.error("[paypal] impossible de démarrer le paiement", error);
    redirect(`${back}?payment=unavailable`);
  }
  if (paypalUrl) redirect(paypalUrl);
  revalidatePath("/", "layout");
  redirect(`${back}?paid=1`);
}
