import { getTranslations } from "next-intl/server";

/**
 * Suivi du dossier en 8 étapes (maquette Lentific) : Demande, Identité,
 * Documents, Étude, Accord, Offre, Signature, Fonds. Calculé à partir du
 * statut de la demande, des pièces demandées et du versement des fonds.
 */

const RANK: Record<string, number> = {
  DRAFT: 0,
  SUBMITTED: 1,
  KYC_PENDING: 1,
  KYC_VERIFIED: 2,
  UNDER_REVIEW: 3,
  PUBLISHED: 4,
  OFFER_ACCEPTED: 5,
  CONTRACT_SIGNED: 6,
  DISBURSED: 7,
};

type StepState = "done" | "current" | "todo";

export function trackerSteps(input: { status: string; pendingDocs: number; fundsConfirmed: boolean }) {
  const rank = RANK[input.status] ?? 0;
  const s = (done: boolean, current: boolean): StepState => (done ? "done" : current ? "current" : "todo");
  const steps: Array<{ key: string; state: StepState }> = [
    { key: "request", state: s(rank >= 1, rank === 0) },
    { key: "identity", state: s(rank >= 2, rank === 1) },
    { key: "documents", state: s(rank >= 2 && input.pendingDocs === 0, input.pendingDocs > 0) },
    { key: "review", state: s(rank >= 4, (rank === 2 || rank === 3) && input.pendingDocs === 0) },
    { key: "approval", state: s(rank >= 4, false) },
    { key: "offer", state: s(rank >= 5, rank === 4) },
    { key: "signature", state: s(rank >= 6, rank === 5) },
    { key: "funds", state: s(input.fundsConfirmed, rank === 6) },
  ];
  const done = steps.filter((x) => x.state === "done").length;
  return { steps, percent: Math.round((done / steps.length) * 100) };
}

export async function ApplicationTracker({
  status,
  pendingDocs,
  fundsConfirmed,
  stopped,
}: {
  status: string;
  pendingDocs: number;
  fundsConfirmed: boolean;
  stopped: boolean;
}) {
  const t = await getTranslations("BorrowerDashboard.tracker");
  const { steps, percent } = trackerSteps({ status, pendingDocs, fundsConfirmed });

  return (
    <div className={`mt-4 ${stopped ? "opacity-50" : ""}`}>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-ink-faint">{t("progress")}</span>
        <span className="font-semibold text-ink">{percent} %</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-brand" style={{ width: `${percent}%` }} />
      </div>
      <ol className="mt-4 grid grid-cols-4 gap-y-4 sm:grid-cols-8">
        {steps.map((step, i) => (
          <li key={step.key} className="flex flex-col items-center text-center">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                step.state === "done"
                  ? "bg-brand text-white"
                  : step.state === "current"
                    ? "border-2 border-accent bg-white text-accent"
                    : "border-2 border-line bg-white text-ink-faint"
              }`}
              aria-hidden
            >
              {step.state === "done" ? "✓" : i + 1}
            </span>
            <span className={`mt-1.5 text-[11px] font-semibold leading-tight ${step.state === "todo" ? "text-ink-faint" : "text-ink"}`}>
              {t(`steps.${step.key}`)}
            </span>
            <span className="text-[10px] leading-tight text-ink-faint">
              {step.key === "documents" && pendingDocs > 0
                ? t("missingDocs", { count: pendingDocs })
                : step.state === "done"
                  ? t("stateDone")
                  : step.state === "current"
                    ? t("stateCurrent")
                    : "—"}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
