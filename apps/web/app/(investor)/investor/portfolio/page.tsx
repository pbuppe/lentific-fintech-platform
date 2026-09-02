import { redirect } from "next/navigation";
import { getPortfolio, listInvestments } from "@fintech/funding";
import { subscriptionsRepo } from "@fintech/database";
import { Card, StatusPill, Button } from "@fintech/ui";
import { getCurrentUser } from "../../../../lib/session";

const STATUS_TONE: Record<string, "ok" | "pending" | "risk"> = {
  ACTIVE: "pending",
  COMPLETED: "ok",
  DEFAULTED: "risk",
  CANCELLED: "risk",
};

const RISK_LABEL: Record<string, string> = { low: "Faible", moderate: "Modéré", high: "Élevé" };

export default async function PortfolioPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [portfolio, investments, subscription] = await Promise.all([
    getPortfolio(user.id),
    listInvestments(user.id),
    subscriptionsRepo.findForUser(user.id),
  ]);
  const isPremium = subscription?.status === "ACTIVE";
  const totalInvested = Number(portfolio?.totalInvested ?? 0);
  const totalReceived = Number(portfolio?.totalReceived ?? 0);

  const defaultedCount = investments.filter((i) => i.status === "DEFAULTED").length;
  const defaultRate = investments.length > 0 ? (defaultedCount / investments.length) * 100 : 0;
  const yieldRate = totalInvested > 0 ? (totalReceived / totalInvested) * 100 : 0;

  const byRisk = new Map<string, number>();
  for (const inv of investments) {
    const level = inv.opportunity.riskLevel;
    byRisk.set(level, (byRisk.get(level) ?? 0) + Number(inv.amount));
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">apps/web · (investor)</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Mon portefeuille</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">Total investi</p>
          <p className="mt-1 font-display text-2xl text-brand-ink">{totalInvested.toLocaleString("fr-FR")} €</p>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">Remboursements reçus</p>
          <p className="mt-1 font-display text-2xl text-success">{totalReceived.toLocaleString("fr-FR")} €</p>
        </Card>
        <Card>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">Investissements actifs</p>
          <p className="mt-1 font-display text-2xl text-ink">{investments.filter((i) => i.status === "ACTIVE").length}</p>
        </Card>
      </div>

      <h2 className="mb-3 mt-8 font-display text-lg text-ink">Performance</h2>
      {isPremium ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">Rendement</p>
            <p className="mt-1 font-display text-2xl text-brand-ink">{yieldRate.toFixed(1)} %</p>
            <p className="mt-1 text-xs text-ink-faint">reçu / investi, cumulé</p>
          </Card>
          <Card>
            <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">Taux de défaut</p>
            <p className="mt-1 font-display text-2xl text-ink">{defaultRate.toFixed(1)} %</p>
            <p className="mt-1 text-xs text-ink-faint">{defaultedCount} / {investments.length} investissement{investments.length > 1 ? "s" : ""}</p>
          </Card>
          <Card>
            <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">Répartition par risque</p>
            <div className="mt-1 grid gap-0.5 text-sm text-ink">
              {byRisk.size === 0 ? (
                <span className="text-ink-faint">—</span>
              ) : (
                Array.from(byRisk.entries()).map(([level, amount]) => (
                  <span key={level}>
                    {RISK_LABEL[level] ?? level} : {amount.toLocaleString("fr-FR")} €
                  </span>
                ))
              )}
            </div>
          </Card>
        </div>
      ) : (
        <Card>
          <p className="text-sm text-ink-soft">
            Le tableau de bord de performance avancé (rendement, taux de défaut, répartition par risque) est
            réservé à la formule Premium.
          </p>
          <Button variant="primary" href="/investor/premium" className="mt-3 inline-block text-xs">
            Découvrir Premium
          </Button>
        </Card>
      )}

      <h2 className="mb-3 mt-8 font-display text-lg text-ink">Historique</h2>
      {investments.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-soft">
            Aucun investissement pour l&apos;instant,{" "}
            <a href="/investor/dashboard" className="text-brand-ink underline">
              découvre la marketplace
            </a>
            .
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {investments.map((inv) => (
            <Card key={inv.id}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-base text-ink">{inv.opportunity.loan.offer.application.purpose}</p>
                <StatusPill tone={STATUS_TONE[inv.status] ?? "pending"}>{inv.status}</StatusPill>
              </div>
              <p className="mt-1 text-sm text-ink-soft">
                {Number(inv.amount).toLocaleString("fr-FR")} € investis · {inv.createdAt.toLocaleDateString("fr-FR")}
              </p>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
