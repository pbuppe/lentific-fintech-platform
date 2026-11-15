import { getLocale } from "next-intl/server";
import { INTRODUCTION_FEE } from "@fintech/introductions";
import { PREMIUM_MONTHLY_AMOUNT } from "@fintech/payments";

/** Prix affiché selon la langue : « 44,90 € » (fr), « €44.90 » (en)… ; sans centimes pour un montant rond. */
export function formatPrice(amount: number, locale: string, currency = "EUR") {
  const cents = Math.round(amount * 100) % 100 !== 0;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Option « Dossier prioritaire » : 49,90 € (décision 2026-11-15), payée d'avance. */
export const PRIORITY_FEE = 49.9;

/** Les tarifs commerciaux, déjà formatés pour la langue de la page. */
export async function commercialPrices() {
  const locale = await getLocale();
  return {
    fee: formatPrice(INTRODUCTION_FEE, locale),
    amount: formatPrice(PREMIUM_MONTHLY_AMOUNT, locale),
    priority: formatPrice(PRIORITY_FEE, locale),
  };
}
