import type { ReactNode } from "react";

type Tone = "ok" | "pending" | "risk";

const toneClasses: Record<Tone, string> = {
  ok: "bg-success-soft text-success",
  pending: "bg-brand-soft text-brand-ink",
  risk: "bg-accent-soft text-accent",
};

/**
 * Statut affiché en pastille, jamais uniquement porté par la couleur (accessibilité) :
 * toujours accompagné d'un libellé texte par l'appelant.
 */
export function StatusPill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
