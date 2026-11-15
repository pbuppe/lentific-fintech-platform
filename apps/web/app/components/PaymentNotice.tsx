import { getTranslations } from "next-intl/server";
import { isPaypalConfigured, paypalMode } from "@fintech/payments";

/** Message affiché au retour de PayPal (annulé, refusé, indisponible, option prioritaire activée). */
export async function PaymentNotice({ payment, priority, introduction }: { payment?: string; priority?: string; introduction?: string }) {
  const t = await getTranslations("PaypalCheckout");
  if (introduction) {
    return <p role="status" className="mb-6 rounded-lg bg-success-soft px-4 py-3 text-sm text-success">{t(introduction === "included" ? "introductionIncluded" : "introductionPaid")}</p>;
  }
  if (priority) {
    return <p role="status" className="mb-6 rounded-lg bg-success-soft px-4 py-3 text-sm text-success">{t("priorityPaid")}</p>;
  }
  if (payment === "cancelled") {
    return <p role="status" className="mb-6 rounded-lg bg-surface-alt px-4 py-3 text-sm text-ink-soft">{t("cancelled")}</p>;
  }
  if (payment === "review") {
    return <p role="status" className="mb-6 rounded-lg bg-sand px-4 py-3 text-sm text-sand-ink">{t("review")}</p>;
  }
  if (payment === "failed" || payment === "unavailable") {
    return <p role="alert" className="mb-6 rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent">{t(payment)}</p>;
  }
  return null;
}

/** Petite mention sous le bouton « Payer » quand PayPal est branché. */
export async function PaypalHint() {
  if (!isPaypalConfigured()) return null;
  const t = await getTranslations("PaypalCheckout");
  return (
    <p className="mt-2 text-xs text-ink-faint">
      {t("hint")}
      {paypalMode() === "sandbox" && <span className="ml-1 rounded bg-sand px-1.5 py-0.5 font-semibold text-sand-ink">{t("sandbox")}</span>}
    </p>
  );
}
