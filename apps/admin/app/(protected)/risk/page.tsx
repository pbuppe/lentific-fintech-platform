import { getTranslations } from "next-intl/server";
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

export default async function RiskPage() {
  const t = await getTranslations("RiskEnginePage");
  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("kicker")}</p>
      <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
        {t("title")}
      </h1>
      <Card className="mt-6">
        <p className="text-sm text-ink-soft">
          {t.rich("demoDescription", {
            code1: (chunks) => <code className="font-mono text-xs">{chunks}</code>,
            code2: (chunks) => <code className="font-mono text-xs">{chunks}</code>,
          })}
        </p>
        <div className="mt-4 flex gap-8">
          <div>
            <div className="font-display text-2xl text-brand">{EXAMPLE.score}</div>
            <div className="text-xs text-ink-faint">{t("scoreLabel")}</div>
          </div>
          <div>
            <div className="font-display text-2xl text-brand">{EXAMPLE.grade}</div>
            <div className="text-xs text-ink-faint">{t("gradeLabel")}</div>
          </div>
          <div>
            <div className="font-display text-2xl text-accent">{EXAMPLE.riskLevel}</div>
            <div className="text-xs text-ink-faint">{t("riskLevelLabel")}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
