"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

// Même formule que packages/loans (buildSchedule), dupliquée ici car ce
// composant tourne dans le navigateur.
function monthlyPayment(amount: number, durationMonths: number, ratePercent: number) {
  const monthlyRate = ratePercent / 12 / 100;
  if (monthlyRate === 0) return amount / durationMonths;
  return (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -durationMonths));
}

export function OfferForm({ action }: { action: (formData: FormData) => void }) {
  const t = useTranslations("OfferForm");
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(5.5);
  const [duration, setDuration] = useState(36);

  const monthly = useMemo(() => monthlyPayment(amount, duration, rate), [amount, duration, rate]);

  return (
    <form action={action} className="grid gap-4">
      <div className="grid grid-cols-3 gap-3">
        <label className="grid gap-1 text-sm text-ink-soft">
          {t("amountLabel")}
          <input
            type="number"
            name="amount"
            min={500}
            required
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            className="rounded-lg border border-line px-3 py-2.5 text-ink"
          />
        </label>
        <label className="grid gap-1 text-sm text-ink-soft">
          {t("rateLabel")}
          <input
            type="number"
            name="rate"
            step="0.1"
            min={0}
            required
            value={rate}
            onChange={(e) => setRate(Number(e.target.value) || 0)}
            className="rounded-lg border border-line px-3 py-2.5 text-ink"
          />
        </label>
        <label className="grid gap-1 text-sm text-ink-soft">
          {t("durationLabel")}
          <input
            type="number"
            name="durationMonths"
            min={1}
            required
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value) || 1)}
            className="rounded-lg border border-line px-3 py-2.5 text-ink"
          />
        </label>
      </div>

      <label className="grid gap-1 text-sm text-ink-soft">
        {t("riskAppetiteLabel")}
        <select name="riskAppetite" defaultValue="moderate" className="rounded-lg border border-line px-3 py-2.5 text-ink">
          <option value="low">{t("riskOnlyLow")}</option>
          <option value="moderate">{t("riskModerateAndLow")}</option>
          <option value="high">{t("riskAllLevels")}</option>
        </select>
      </label>

      <div className="rounded-lg bg-surface-alt p-3 text-sm text-ink-soft">
        {t("previewText", { duration, rate })}{" "}
        <span className="font-semibold text-ink">
          {t("previewMonthly", { monthly: monthly.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) })}
        </span>
      </div>

      <button className="justify-self-start rounded-lg bg-yellow px-4 py-2.5 text-sm font-semibold text-ink hover:bg-yellow-ink">
        {t("submit")}
      </button>
    </form>
  );
}
