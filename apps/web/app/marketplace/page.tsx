import { listOpportunities, listOpenInvestorListings } from "@fintech/funding";
import { buildSchedule } from "@fintech/loans";
import { Card, StatusPill, Button } from "@fintech/ui";

const RISK_LABEL: Record<string, string> = { low: "Faible", moderate: "Modéré", high: "Élevé" };
const RISK_APPETITE_LABEL: Record<string, string> = {
  low: "N'accepte que le risque faible",
  moderate: "Accepte risque modéré et faible",
  high: "Accepte tous niveaux de risque",
};

export default async function PublicMarketplacePage() {
  const [opportunities, listings] = await Promise.all([
    listOpportunities().catch(() => []),
    listOpenInvestorListings().catch(() => []),
  ]);

  return (
    <main>
      <section className="bg-gradient-to-b from-brand to-brand-ink px-6 py-12 text-white sm:px-12">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-xs uppercase tracking-widest text-white/70">Marketplace P2P</p>
          <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
            Emprunteurs et investisseurs, au même endroit
          </h1>
          <p className="mt-3 max-w-2xl text-white/80">
            D&apos;un côté, des dossiers déjà vérifiés (particuliers comme PME) qui cherchent des
            investisseurs. De l&apos;autre, des investisseurs (particuliers, entreprises ou structures) qui
            annoncent le capital qu&apos;ils sont prêts à prêter, pour que tu saches, avant même de déposer
            une demande, ce qui est disponible.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10 sm:px-12">
        <h2 className="font-display text-xl font-semibold text-ink">Capitaux disponibles chez nos investisseurs</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Ces investisseurs ont annoncé être prêts à prêter : utile pour estimer tes chances avant de déposer
          une demande.
        </p>

        {listings.length === 0 ? (
          <Card className="mt-4">
            <p className="text-sm text-ink-soft">Aucun investisseur n&apos;a publié de capital disponible pour l&apos;instant.</p>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {listings.map((listing) => {
              const amount = Number(listing.amountAvailable);
              const rate = Number(listing.preferredRate);
              const monthly = buildSchedule(amount, listing.preferredDurationMonths, rate)[0]?.amount ?? 0;
              return (
                <Card key={listing.id} accented>
                  <div className="flex items-center justify-between">
                    <p className="font-display text-lg text-brand-ink">
                      {amount.toLocaleString("fr-FR")} € disponibles
                    </p>
                    {listing.investor.investorProfile?.verificationStatus === "VERIFIED" && (
                      <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                        Investisseur vérifié ✓
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">
                    {listing.investor.name ?? "Investisseur"} · Taux souhaité {rate}% · Durée préférée{" "}
                    {listing.preferredDurationMonths} mois
                  </p>
                  <p className="mt-2 rounded-lg bg-surface-alt px-3 py-2 text-sm text-ink">
                    Mensualité indicative pour un emprunteur : <span className="font-semibold">{monthly.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} € / mois</span>
                  </p>
                  <p className="mt-2 text-xs text-ink-faint">{RISK_APPETITE_LABEL[listing.riskAppetite] ?? listing.riskAppetite}</p>
                  <Button variant="ghost" href="/login" className="mt-3 inline-block text-center text-xs">
                    Se connecter pour demander sa mise en relation (15 €)
                  </Button>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-6">
          <Button variant="primary" href="/demande">Déposer une demande de financement</Button>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10 sm:px-12">
        <h2 className="font-display text-xl font-semibold text-ink">Dossiers déjà signés, ouverts au financement</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Ces dossiers ont déjà été vérifiés (identité, analyse de risque) et leur contrat a été signé.
        </p>

        {opportunities.length === 0 ? (
          <Card className="mt-4">
            <p className="text-sm text-ink-soft">
              Aucune opportunité ouverte pour l&apos;instant, reviens bientôt, ou{" "}
              <a href="/signup?role=BORROWER" className="text-brand-ink underline">
                dépose une demande de financement
              </a>
              .
            </p>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {opportunities.map((opp) => {
              const funded = Number(opp.fundedAmount);
              const target = Number(opp.targetAmount);
              const pct = target > 0 ? Math.min(100, Math.round((funded / target) * 100)) : 0;
              const purpose = opp.loan.offer.application.purpose;
              return (
                <Card key={opp.id}>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-lg text-ink">{purpose}</h3>
                    <StatusPill tone={opp.riskLevel === "high" ? "risk" : opp.riskLevel === "low" ? "ok" : "pending"}>
                      Risque {RISK_LABEL[opp.riskLevel] ?? opp.riskLevel}
                    </StatusPill>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-faint">Dossier {opp.loan.offer.application.reference}</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-alt">
                    <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-2 text-sm text-ink-soft">
                    {funded.toLocaleString("fr-FR")} € / {target.toLocaleString("fr-FR")} € financés ({pct}%)
                  </p>
                  <Button variant="primary" href="/signup?role=INVESTOR" className="mt-3 inline-block text-center text-xs">
                    Se connecter pour investir
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
