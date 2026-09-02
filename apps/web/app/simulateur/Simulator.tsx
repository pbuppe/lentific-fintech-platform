"use client";

import { useMemo, useState } from "react";

// Même formule que buildSchedule() de @fintech/loans, dupliquée ici volontairement
// car ce composant tourne dans le navigateur (Prisma, utilisé par @fintech/loans,
// n'est pas exécutable côté client).
function monthlyPayment(amount: number, durationMonths: number, ratePercent: number) {
  const monthlyRate = ratePercent / 12 / 100;
  if (monthlyRate === 0) return amount / durationMonths;
  return (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -durationMonths));
}

export function Simulator() {
  const [amount, setAmount] = useState(15000);
  const [duration, setDuration] = useState(24);
  const [rate, setRate] = useState(5.9);

  const monthly = useMemo(() => monthlyPayment(amount, duration, rate), [amount, duration, rate]);
  const total = monthly * duration;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="grid gap-5">
        <label className="grid gap-2 text-sm text-ink-soft">
          Montant souhaité : <span className="font-semibold text-ink">{amount.toLocaleString("fr-FR")} €</span>
          <input
            type="range"
            min={2000}
            max={100000}
            step={500}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="accent-brand"
          />
        </label>
        <label className="grid gap-2 text-sm text-ink-soft">
          Durée : <span className="font-semibold text-ink">{duration} mois</span>
          <input
            type="range"
            min={3}
            max={84}
            step={1}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="accent-brand"
          />
        </label>
        <label className="grid gap-2 text-sm text-ink-soft">
          Taux annuel : <span className="font-semibold text-ink">{rate.toFixed(1)}%</span>
          <input
            type="range"
            min={1}
            max={15}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="accent-brand"
          />
        </label>
      </div>

      <div className="rounded-xl border border-line bg-surface-alt p-5">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">Estimation</p>
        <p className="mt-2 font-display text-3xl font-semibold text-brand-ink">
          {monthly.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} € / mois
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          Coût total estimé : {total.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} € (taux simulé {rate.toFixed(1)}%, le taux réel dépend de ton dossier)
        </p>
        <a
          href="/signup?role=BORROWER"
          className="mt-4 inline-block rounded-lg bg-yellow px-4 py-2.5 text-sm font-semibold text-ink hover:bg-yellow-ink"
        >
          Déposer une demande
        </a>
      </div>
    </div>
  );
}
