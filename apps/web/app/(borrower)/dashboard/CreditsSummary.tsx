import { getTranslations, getLocale } from "next-intl/server";

/**
 * « Mes crédits » : montant de chaque crédit et où il en est, du dossier en
 * étude jusqu'à la mise à disposition des fonds. Le montant est compté comme
 * crédité dès que le versement est validé par le super admin, même si le
 * notaire ou la banque n'a pas encore libéré les fonds.
 */
export type CreditStage = "study" | "granted" | "verifying" | "releasing" | "available" | "refused" | "cancelled";

export type CreditRow = {
  id: string;
  reference: string;
  purpose: string;
  amount: number;
  currency: string;
  requestedAt: Date;
  stage: CreditStage;
  where?: "NOTARY_CHECKS" | "BANK_CHECKS" | null;
  date?: Date | null;
};

type App = {
  id: string;
  reference: string;
  purpose: string;
  status: string;
  amount: unknown;
  createdAt: Date;
  currency: { code: string };
  offers: Array<{ status: string; amount: unknown }>;
  disbursement: null | { status: string; availability: string; fundsDate: Date; availableAt: Date | null; declaredAt: Date };
};

export function toCreditRows(apps: App[]): CreditRow[] {
  return apps
    .filter((a) => a.status !== "DRAFT")
    .map((a) => {
      const accepted = a.offers.find((o) => o.status === "ACCEPTED");
      const d = a.disbursement;
      let stage: CreditStage;
      let where: CreditRow["where"] = null;
      let date: Date | null = null;
      if (a.status === "REJECTED") stage = "refused";
      else if (a.status === "CANCELLED") stage = "cancelled";
      else if (d?.status === "DECLARED") { stage = "verifying"; date = d.declaredAt; }
      else if (d?.status === "CONFIRMED" && d.availability !== "AVAILABLE") {
        stage = "releasing";
        where = d.availability as CreditRow["where"];
        date = d.fundsDate;
      } else if (d?.status === "CONFIRMED") { stage = "available"; date = d.availableAt ?? d.fundsDate; }
      else if (a.status === "DISBURSED") stage = "available"; // versé avant la mise en place du suivi des versements
      else if (a.status === "OFFER_ACCEPTED" || a.status === "CONTRACT_SIGNED") stage = "granted";
      else stage = "study";
      return {
        id: a.id,
        reference: a.reference,
        purpose: a.purpose,
        amount: Number(accepted?.amount ?? a.amount),
        currency: a.currency.code,
        requestedAt: a.createdAt,
        stage,
        where,
        date,
      };
    });
}

const PILL: Record<CreditStage, string> = {
  study: "bg-surface-alt text-ink-soft border border-line",
  granted: "bg-brand-soft text-brand-ink",
  verifying: "bg-sand text-sand-ink",
  releasing: "bg-sand text-sand-ink",
  available: "bg-success-soft text-success",
  refused: "bg-accent-soft text-accent",
  cancelled: "bg-surface-alt text-ink-faint border border-line",
};

export async function CreditsSummary({ rows }: { rows: CreditRow[] }) {
  if (rows.length === 0) return null;
  const t = await getTranslations("CreditsSummary");
  const locale = await getLocale();
  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
  const money = (v: number, c: string) => new Intl.NumberFormat(locale, { style: "currency", currency: c, maximumFractionDigits: 0 }).format(v);

  // Totaux par devise (en pratique une seule : l'euro).
  const sum = (stages: CreditStage[]) => {
    const by = new Map<string, number>();
    for (const r of rows) if (stages.includes(r.stage)) by.set(r.currency, (by.get(r.currency) ?? 0) + r.amount);
    return by.size ? [...by].map(([c, v]) => money(v, c)).join(" · ") : null;
  };
  const credited = sum(["releasing", "available"]);
  const available = sum(["available"]);
  const verifying = sum(["verifying"]);
  const releasing = sum(["releasing"]);

  const detail = (r: CreditRow) => {
    switch (r.stage) {
      case "verifying":
        return t("detail.verifying");
      case "releasing":
        return r.where === "NOTARY_CHECKS" ? t("detail.releasingNotary") : t("detail.releasingBank");
      case "available":
        return r.date ? t("detail.availableOn", { date: dateFmt.format(r.date) }) : t("detail.available");
      case "granted":
        return t("detail.granted");
      case "study":
        return t("detail.study");
      default:
        return null;
    }
  };

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-line bg-surface" aria-labelledby="my-credits">
      <div className="grid gap-4 bg-brand p-5 text-white sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/75">{t("credited")}</p>
          <p className="font-display text-3xl font-semibold">{credited ?? money(0, rows[0].currency)}</p>
          {credited && releasing && <p className="mt-1 text-xs text-white/85">{t("creditedNote", { amount: releasing })}</p>}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/75">{t("availableTotal")}</p>
          <p className="font-display text-xl font-semibold">{available ?? money(0, rows[0].currency)}</p>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/75">{t("verifyingTotal")}</p>
          <p className="font-display text-xl font-semibold">{verifying ?? money(0, rows[0].currency)}</p>
        </div>
      </div>

      <div className="p-5">
        <h2 id="my-credits" className="font-display text-lg font-semibold text-ink">{t("title")}</h2>
        <p className="text-xs text-ink-faint">{t("subtitle")}</p>
        <ul className="mt-4 divide-y divide-line">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              <div className="min-w-0 flex-1">
                <a href={`#${r.id}`} className="text-sm font-semibold text-ink hover:text-brand">{r.reference}</a>
                <p className="truncate text-xs text-ink-faint">
                  {r.purpose} · {t("requestedOn", { date: dateFmt.format(r.requestedAt) })}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-display text-lg font-semibold ${r.stage === "refused" || r.stage === "cancelled" ? "text-ink-faint line-through" : "text-ink"}`}>
                  {money(r.amount, r.currency)}
                </p>
              </div>
              <div className="w-full sm:w-64">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${PILL[r.stage]}`}>{t(`stage.${r.stage}`)}</span>
                {detail(r) && <p className="mt-0.5 text-xs text-ink-soft">{detail(r)}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
