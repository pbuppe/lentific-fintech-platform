"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { prisma, subscriptionsRepo } from "@fintech/database";
import {
  subscribe,
  cancelSubscription,
  isPaypalConfigured,
  startPremiumCheckout,
  cancelPremium,
  PremiumError,
  premiumTierFor,
  PREMIUM_MONTHLY_AMOUNT,
} from "@fintech/payments";
import { webBaseUrl } from "@fintech/auth";
import { getCurrentUser } from "../session";
import { PAYPAL_LOCALES } from "../paypalCheckout";
import { premiumPath } from "../premiumPath";

/** S'abonner (ou se réabonner) à Premium : PayPal si branché, sinon abonnement simulé. */
export async function subscribePremiumAction() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const page = premiumPath(user.role);
  const eur = await prisma.currency.findUniqueOrThrow({ where: { code: "EUR" } });

  if (!isPaypalConfigured()) {
    await subscribe(user.id, premiumTierFor(user.role), PREMIUM_MONTHLY_AMOUNT, eur.id);
    revalidatePath("/", "layout");
    redirect(`${page}?premium=active`);
  }

  let url: string;
  try {
    const base = webBaseUrl();
    url = await startPremiumCheckout({
      userId: user.id,
      currencyId: eur.id,
      currencyCode: eur.code,
      returnUrl: `${base}/paiement/paypal/abonnement/retour`,
      cancelUrl: `${base}/paiement/paypal/abonnement/annule`,
      locale: PAYPAL_LOCALES[await getLocale()],
    });
  } catch (error) {
    if (error instanceof PremiumError) redirect(page);
    console.error("[paypal] impossible de démarrer l'abonnement", error);
    redirect(`${page}?premium=unavailable`);
  }
  redirect(url);
}

/** Résilier : plus aucun prélèvement, Premium reste actif jusqu'à la fin de la période payée. */
export async function cancelPremiumAction() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const page = premiumPath(user.role);
  try {
    const sub = await subscriptionsRepo.findForUser(user.id);
    if (sub?.provider === "paypal") await cancelPremium(user.id);
    else await cancelSubscription(user.id);
  } catch (error) {
    console.error("[paypal] résiliation impossible", error);
    redirect(`${page}?premium=cancel_failed`);
  }
  revalidatePath("/", "layout");
  redirect(`${page}?premium=cancelled`);
}
