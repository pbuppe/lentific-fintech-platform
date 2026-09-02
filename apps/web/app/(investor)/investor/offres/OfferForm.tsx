"use client";

import { useMemo, useState } from "react";

// Même formule que packages/loans (buildSchedule), dupliquée ici car ce
// composant tourne dans le navigateur.
function monthlyPayment(amount: number, durationMonths: number, ratePercent: number) {
  const monthlyRate = ratePercent / 12 / 100;
  if (monthlyRate === 0) return amount / durationMonths;
  return (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -durationMonths));
}

export function OfferForm({ action }: { action: (formData: FormData) => void }) {
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(5.5);
  const [duration, setDuration] = useState(36);

  const monthly = useMemo(() => monthlyPayment(amount, duration, rate), [amount, duration, rate]);

  return (
    <form action={action} className="grid gap-4">
      <div className="grid grid-cols-3 gap-3">
        <label className="grid gap-1 text-sm text-ink-soft">
          Montant disponible (€)
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
          Taux souhaité (%)
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
          Durée préférée (mois)
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
        Niveau de risque accepté
        <select name="riskAppetite" defaultValue="moderate" className="rounded-lg border border-line px-3 py-2.5 text-ink">
          <option value="low">Faible uniquement</option>
          <option value="moderate">Modéré et faible</option>
          <option value="high">Tous niveaux, y compris élevé</option>
        </select>
      </label>

      <div className="rounded-lg bg-surface-alt p-3 text-sm text-ink-soft">
        Pour un emprunteur qui utiliserait la totalité de ce montant sur {duration} mois à {rate}% :{" "}
        <span className="font-semibold text-ink">
          {monthly.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} € / mois
        </span>
      </div>

      <button className="justify-self-start rounded-lg bg-yellow px-4 py-2.5 text-sm font-semibold text-ink hover:bg-yellow-ink">
        Publier cette offre
      </button>
    </form>
  );
}
