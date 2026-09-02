import { assessRisk } from "@fintech/risk";
import { Card } from "@fintech/ui";

// Exemple d'utilisation du moteur de risque (§14), à remplacer par un vrai
// listing des dossiers avec leur score une fois la base connectée.
const EXAMPLE = assessRisk({
  income: 3200,
  expenses: 1400,
  existingDebt: 0,
  requestedAmount: 18500,
  durationMonths: 24,
});

export default function RiskPage() {
  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">apps/admin · risk</p>
      <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
        Moteur de risque
      </h1>
      <Card className="mt-6">
        <p className="text-sm text-ink-soft">
          Exemple calculé par <code className="font-mono text-xs">assessRisk()</code> de{" "}
          <code className="font-mono text-xs">@fintech/risk</code> pour le dossier de démo
          (18 500 € / 24 mois) :
        </p>
        <div className="mt-4 flex gap-8">
          <div>
            <div className="font-display text-2xl text-brand">{EXAMPLE.score}</div>
            <div className="text-xs text-ink-faint">Score</div>
          </div>
          <div>
            <div className="font-display text-2xl text-brand">{EXAMPLE.grade}</div>
            <div className="text-xs text-ink-faint">Note</div>
          </div>
          <div>
            <div className="font-display text-2xl text-accent">{EXAMPLE.riskLevel}</div>
            <div className="text-xs text-ink-faint">Niveau de risque</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
