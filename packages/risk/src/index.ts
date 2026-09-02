/**
 * packages/risk : scoring, capacité de remboursement, niveau de risque (§14).
 * Modèle volontairement simple (règle du taux d'endettement) pour ce sprint,
 * conçu pour être remplacé par un vrai modèle de scoring sans changer l'interface
 * consommée par packages/applications.
 */
export interface RiskInput {
  income: number;
  expenses: number;
  existingDebt: number;
  requestedAmount: number;
  durationMonths: number;
}

export interface RiskResult {
  score: number; // 0-100
  grade: "A" | "A-" | "B+" | "B" | "C" | "D";
  riskLevel: "low" | "moderate" | "high";
}

/** Dérive le niveau de risque à partir d'un score déjà calculé (ex. relu depuis la base). */
export function riskLevelFromScore(score: number): RiskResult["riskLevel"] {
  return score >= 65 ? "low" : score >= 40 ? "moderate" : "high";
}

export function assessRisk(input: RiskInput): RiskResult {
  const disposableIncome = input.income - input.expenses - input.existingDebt;
  const monthlyPayment = input.requestedAmount / input.durationMonths;
  const debtToIncomeRatio = disposableIncome > 0 ? monthlyPayment / disposableIncome : 1;

  const score = Math.max(0, Math.min(100, Math.round(100 - debtToIncomeRatio * 100)));

  const grade =
    score >= 85 ? "A" : score >= 75 ? "A-" : score >= 65 ? "B+" : score >= 50 ? "B" : score >= 30 ? "C" : "D";

  const riskLevel = score >= 65 ? "low" : score >= 40 ? "moderate" : "high";

  return { score, grade, riskLevel };
}
