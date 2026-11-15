"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

/** Estimation de mensualité du site vitrine (maquette SODIVA), purement indicative. */
function monthlyPayment(amount: number, months: number, ratePct: number) {
  const r = ratePct / 12 / 100;
  return r === 0 ? amount / months : (amount * r) / (1 - Math.pow(1 + r, -months));
}

export function HeroEstimator() {
  const t = useTranslations("HomeBroker.estimator");
  const locale = useLocale();
  const [amount, setAmount] = useState(150000);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(3.6);
  const monthly = useMemo(() => monthlyPayment(amount, years * 12, rate), [amount, years, rate]);
  const fmt = (v: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

  return (
    <div className="rounded-2xl bg-white p-6 text-ink shadow-xl">
      <p className="font-display text-lg font-semibold text-brand">{t("title")}</p>
      <div className="mt-4 grid gap-4">
        <label className="grid gap-1.5 text-sm text-ink-soft">
          <span className="flex justify-between">
            {t("amount")} <span className="font-semibold text-ink">{fmt(amount)}</span>
          </span>
          <input type="range" min={5000} max={600000} step={5000} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="accent-brand" />
        </label>
        <label className="grid gap-1.5 text-sm text-ink-soft">
          <span className="flex justify-between">
            {t("duration")} <span className="font-semibold text-ink">{t("years", { years })}</span>
          </span>
          <input type="range" min={1} max={30} step={1} value={years} onChange={(e) => setYears(Number(e.target.value))} className="accent-brand" />
        </label>
        <label className="grid gap-1.5 text-sm text-ink-soft">
          <span className="flex justify-between">
            {t("rate")} <span className="font-semibold text-ink">{rate.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %</span>
          </span>
          <input type="range" min={0.5} max={12} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="accent-brand" />
        </label>
      </div>
      <div className="mt-5 rounded-xl bg-brand-soft p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink">{t("result")}</p>
        <p className="font-display text-3xl font-semibold text-brand-ink">
          {fmt(monthly)} <span className="text-base font-normal">{t("perMonth")}</span>
        </p>
        <p className="mt-1 text-xs text-ink-soft">{t("total", { total: fmt(monthly * years * 12) })}</p>
      </div>
      <a href="#contact" className="mt-4 block rounded-lg bg-yellow px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-yellow-ink">
        {t("cta")}
      </a>
      <p className="mt-3 text-[11px] leading-snug text-ink-faint">{t("legal")}</p>
    </div>
  );
}
