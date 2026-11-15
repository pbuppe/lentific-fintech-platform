import { getTranslations, getLocale } from "next-intl/server";
import { colors } from "@fintech/ui/src/tokens";
import { amortization, remainingAfter } from "../../../lib/loanMath";

/**
 * « Mon crédit » (maquette Lentific) : part remboursée, chiffres clés, capital
 * restant dû par année, dernières / prochaines échéances et tableau
 * d'amortissement complet. Les échéances payées viennent de la base
 * (Repayment) ; tant qu'aucune n'est enregistrée, rien n'est compté comme payé.
 */
export async function LoanOverview({
  reference,
  amount,
  rate,
  months,
  start,
  currency,
  repayments,
}: {
  reference: string;
  amount: number;
  rate: number;
  months: number;
  start: Date;
  currency: string;
  repayments: Array<{ dueDate: Date; amount: unknown; status: string; paidAt: Date | null }>;
}) {
  const t = await getTranslations("BorrowerDashboard.loan");
  const locale = await getLocale();
  const money = (v: number, digits = 0) =>
    new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v);
  const day = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
  const monthYear = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });

  const schedule = amortization(amount, rate, months, start);
  const paidCount = Math.min(months, repayments.filter((r) => r.status === "PAID").length);
  const remaining = remainingAfter(amount, rate, months, paidCount);
  const repaid = amount - remaining;
  const pct = amount > 0 ? (repaid / amount) * 100 : 0;
  const monthly = schedule[0]?.payment ?? 0;
  const totalInterest = schedule.reduce((sum, l) => sum + l.interest, 0);
  const nextDue = repayments.find((r) => r.status !== "PAID")?.dueDate ?? schedule[paidCount]?.dueDate ?? null;
  const end = schedule[schedule.length - 1]?.dueDate ?? null;

  // Une barre par trimestre pour les prêts courts, par année au-delà de 3 ans.
  const step = months <= 36 ? 3 : 12;
  const bars = Array.from({ length: Math.ceil(months / step) + 1 }, (_, i) => {
    const k = Math.min(months, i * step);
    const date = new Date(start);
    date.setMonth(date.getMonth() + k);
    return { key: k, label: monthYear.format(date), value: remainingAfter(amount, rate, months, k), past: k <= paidCount };
  });

  const kpis = [
    [t("borrowed"), money(amount)],
    [t("repaid"), money(repaid)],
    [t("remaining"), money(remaining)],
    [t("monthly"), money(monthly, 2)],
    [t("nextDue"), nextDue ? day.format(nextDue) : "—"],
    [t("end"), end ? monthYear.format(end) : "—"],
  ];

  const paidLines = schedule.slice(0, paidCount).slice(-4).reverse();
  const upcoming = schedule.slice(paidCount, paidCount + 4);

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs text-ink-faint">{t("kicker", { reference })}</p>
          <h2 className="font-display text-xl font-semibold text-ink">{t("title")}</h2>
        </div>
        <span className="rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">{t("inProgress")}</span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-6">
        <div
          className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full"
          style={{ background: `conic-gradient(${colors.brand} 0 ${pct}%, ${colors.line} ${pct}% 100%)` }}
          role="img"
          aria-label={t("donutLabel", { pct: Math.round(pct) })}
        >
          <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-surface">
            <span className="font-display text-2xl font-semibold text-ink">{Math.round(pct)} %</span>
            <span className="text-xs text-ink-faint">{t("repaidShort")}</span>
          </div>
        </div>
        <dl className="grid min-w-[260px] flex-1 grid-cols-2 gap-3">
          {kpis.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-surface-alt px-3 py-2.5">
              <dt className="text-[11px] text-ink-faint">{label}</dt>
              <dd className="mt-0.5 text-base font-semibold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="mt-6 text-sm font-semibold text-ink">{t("curveTitle")}</p>
      <div className="mt-2 flex h-32 items-end gap-1 border-b border-line" aria-hidden>
        {bars.map((b) => (
          <span
            key={b.key}
            title={`${b.label} : ${money(b.value)}`}
            className={`flex-1 rounded-t ${b.past ? "bg-brand" : "bg-line"}`}
            style={{ height: `${Math.max(3, (b.value / amount) * 120)}px` }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-ink-faint">
        <span>{bars[0]?.label}</span>
        <span>{bars[bars.length - 1]?.label}</span>
      </div>
      <p className="mt-2 text-xs text-ink-faint">{t("totalInterest", { amount: money(totalInterest) })}</p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-ink">{paidLines.length > 0 ? t("lastPaid") : t("upcoming")}</p>
          <ul className="mt-2 divide-y divide-line">
            {(paidLines.length > 0 ? paidLines : upcoming).map((l) => (
              <li key={l.index} className="flex items-center justify-between py-2 text-sm">
                <span>
                  <span className="font-semibold capitalize text-ink">{monthYear.format(l.dueDate)}</span>
                  <span className="block text-xs text-ink-faint">{t("ofWhichInterest", { amount: money(l.interest, 2) })}</span>
                </span>
                <span className="text-right">
                  <span className="font-semibold text-ink">{money(l.payment, 2)}</span>
                  <span className={`block text-xs font-semibold ${l.index <= paidCount ? "text-success" : "text-ink-faint"}`}>
                    {l.index <= paidCount ? t("paid") : t("toCome")}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <details className="self-start rounded-xl bg-surface-alt p-3 text-sm">
          <summary className="cursor-pointer font-semibold text-ink">{t("fullSchedule", { count: months })}</summary>
          <div className="mt-3 max-h-72 overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-surface-alt text-ink-faint">
                <tr>
                  <th className="py-1 pr-2">#</th>
                  <th className="py-1 pr-2">{t("colDate")}</th>
                  <th className="py-1 pr-2 text-right">{t("colPayment")}</th>
                  <th className="py-1 pr-2 text-right">{t("colInterest")}</th>
                  <th className="py-1 text-right">{t("colRemaining")}</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((l) => (
                  <tr key={l.index} className={`border-t border-line ${l.index <= paidCount ? "text-ink-faint" : "text-ink"}`}>
                    <td className="py-1 pr-2">{l.index}</td>
                    <td className="py-1 pr-2">{day.format(l.dueDate)}</td>
                    <td className="py-1 pr-2 text-right">{money(l.payment, 2)}</td>
                    <td className="py-1 pr-2 text-right">{money(l.interest, 2)}</td>
                    <td className="py-1 text-right">{money(l.remaining, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </section>
  );
}
