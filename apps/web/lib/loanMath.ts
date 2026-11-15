/**
 * Calculs de prêt amortissable à mensualités constantes, pour l'espace client
 * (demande produit 2026-11-14, maquette SODIVA : capital restant dû, part
 * d'intérêts, courbe annuelle). Fonctions pures, sans accès base de données.
 */

export function monthlyPayment(principal: number, annualRatePct: number, months: number) {
  const r = annualRatePct / 12 / 100;
  if (months <= 0) return 0;
  return r === 0 ? principal / months : (principal * r) / (1 - Math.pow(1 + r, -months));
}

/** Capital restant dû après k mensualités payées. */
export function remainingAfter(principal: number, annualRatePct: number, months: number, k: number) {
  const r = annualRatePct / 12 / 100;
  const m = monthlyPayment(principal, annualRatePct, months);
  const n = Math.max(0, Math.min(k, months));
  if (r === 0) return Math.max(0, principal - m * n);
  return Math.max(0, principal * Math.pow(1 + r, n) - (m * (Math.pow(1 + r, n) - 1)) / r);
}

export type ScheduleLine = { index: number; dueDate: Date; payment: number; interest: number; principal: number; remaining: number };

export function amortization(principal: number, annualRatePct: number, months: number, start: Date): ScheduleLine[] {
  const r = annualRatePct / 12 / 100;
  const m = monthlyPayment(principal, annualRatePct, months);
  const lines: ScheduleLine[] = [];
  let remaining = principal;
  for (let i = 1; i <= months; i++) {
    const interest = remaining * r;
    const capital = Math.min(remaining, m - interest);
    remaining = Math.max(0, remaining - capital);
    const dueDate = new Date(start);
    dueDate.setMonth(dueDate.getMonth() + i);
    lines.push({ index: i, dueDate, payment: m, interest, principal: capital, remaining });
  }
  return lines;
}
