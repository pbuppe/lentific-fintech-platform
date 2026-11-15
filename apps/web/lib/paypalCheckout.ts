import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@fintech/database";
import { webBaseUrl } from "@fintech/auth";
import { startPaypalCheckout, type OnlinePurpose } from "@fintech/payments";

/** Pages vers lesquelles le client peut revenir après PayPal (liste fermée). */
export const PAYPAL_BACK_PAGES = ["/dashboard", "/paiements", "/investisseurs", "/investor/dashboard"] as const;
export type PaypalBack = (typeof PAYPAL_BACK_PAGES)[number];

export function safeBack(value: string | null | undefined): PaypalBack {
  return PAYPAL_BACK_PAGES.includes(value as PaypalBack) ? (value as PaypalBack) : "/dashboard";
}

export const PAYPAL_LOCALES: Record<string, string> = {
  fr: "fr-FR", en: "en-GB", es: "es-ES", it: "it-IT", hu: "hu-HU", pt: "pt-PT", de: "de-DE", nl: "nl-NL",
};

/** Lance le paiement PayPal et renvoie l'adresse PayPal où envoyer le client. */
export async function beginPaypalPayment(input: {
  userId: string;
  amount: number;
  currencyId: string;
  purpose: OnlinePurpose;
  targetId: string;
  reference: string;
  back: PaypalBack;
}) {
  const currency = await prisma.currency.findUniqueOrThrow({ where: { id: input.currencyId } });
  const t = await getTranslations("PaypalCheckout");
  const locale = await getLocale();
  const base = webBaseUrl();
  return startPaypalCheckout({
    userId: input.userId,
    amount: input.amount,
    currencyId: input.currencyId,
    currencyCode: currency.code,
    purpose: input.purpose,
    targetId: input.targetId,
    description: t(`description.${input.purpose}`, { reference: input.reference }),
    returnUrl: `${base}/paiement/paypal/retour?back=${encodeURIComponent(input.back)}`,
    cancelUrl: `${base}/paiement/paypal/annule?back=${encodeURIComponent(input.back)}`,
    locale: PAYPAL_LOCALES[locale],
  });
}
