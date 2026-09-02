import { Button, Card, StatusPill } from "@fintech/ui";
import { prisma } from "@fintech/database";
import { listOpportunities, listOpenInvestorListings } from "@fintech/funding";

const BORROWER_STEPS = [
  { n: "01", title: "Simule ton besoin", body: "Montant, durée, mensualité estimée, sans engagement, sans compte." },
  { n: "02", title: "Complète ton profil", body: "Une seule fois : revenus, charges, situation. Servira à toutes tes demandes." },
  { n: "03", title: "Dépose ta demande", body: "Envoie une pièce d'identité, un agent vérifie ton dossier sous peu." },
  { n: "04", title: "Reçois une offre", body: "Le moteur de risque calcule un score, un agent te propose un financement." },
  { n: "05", title: "Signe et sois financé", body: "Accepte l'offre, signe ton contrat, et laisse la marketplace le financer." },
];

const INVESTOR_STEPS = [
  { n: "01", title: "Crée ton compte investisseur", body: "Renseigne ton profil et ta tolérance au risque." },
  { n: "02", title: "Parcours la marketplace", body: "Chaque dossier affiché est déjà vérifié et son contrat signé." },
  { n: "03", title: "Investis le montant de ton choix", body: "Financement fractionné : plusieurs investisseurs par dossier." },
  { n: "04", title: "Suis ton portefeuille", body: "Total investi, remboursements reçus, historique, en un coup d'œil." },
];

const TRUST_POINTS = [
  { title: "Ouvert à tous", body: "Particuliers, PME et structures : chacun peut emprunter ou prêter, sans minimum réservé aux professionnels." },
  { title: "Scoring instantané", body: "Le moteur de risque évalue la capacité de remboursement dès le dépôt du dossier." },
  { title: "Financement fractionné", body: "Un même besoin peut être couvert par plusieurs investisseurs, répartis automatiquement." },
  { title: "Vérifié à chaque étape", body: "Identité vérifiée manuellement, contrat encadré juridiquement, signature confirmée par un agent." },
];

const RISK_LABEL: Record<string, string> = { low: "Faible", moderate: "Modéré", high: "Élevé" };

export default async function LandingPage() {
  const [opportunities, investorListings, investedAgg, fundedDossiersCount, verifiedInvestorsCount] = await Promise.all([
    listOpportunities().catch(() => []),
    listOpenInvestorListings().catch(() => []),
    prisma.investment.aggregate({ _sum: { amount: true } }).catch(() => ({ _sum: { amount: null } })),
    prisma.application.count({ where: { status: { in: ["CONTRACT_SIGNED", "DISBURSED"] } } }).catch(() => 0),
    prisma.investorProfile.count({ where: { verificationStatus: "VERIFIED" } }).catch(() => 0),
  ]);
  const preview = opportunities.slice(0, 2);
  const totalAvailable = investorListings.reduce((sum, l) => sum + Number(l.amountAvailable), 0);
  const totalInvested = Number(investedAgg._sum.amount ?? 0);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand to-brand-ink px-6 py-16 text-white sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-white/70">
            Financement participatif · P2P
          </p>
          <h1 className="font-display text-4xl font-semibold text-balance sm:text-5xl">
            Le financement se répartit <span className="text-[#FF9AA2]">en confiance</span>, pas au hasard.
          </h1>
          <p className="mt-4 max-w-xl text-white/80">
            Lentific met en relation particuliers, PME et structures qui cherchent un financement avec des
            investisseurs (particuliers, entreprises ou institutions) qui veulent faire fructifier leur
            épargne, avec un dossier vérifié à chaque étape : identité, capacité de remboursement, contrat signé.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="primary" href="/signup?role=BORROWER">
              Déposer une demande
            </Button>
            <Button variant="ghost" href="/marketplace" className="border-white/30 text-white hover:bg-white/10">
              Voir la marketplace
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/70">
            <a href="/login" className="underline underline-offset-4 hover:text-white">Déjà un compte ? Se connecter</a>
          </div>
        </div>
      </section>

      {/* Chiffres de la plateforme */}
      <section className="border-b border-line bg-surface px-6 py-6 sm:px-12">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            <div>
              <p className="font-display text-2xl font-semibold text-brand-ink">
                {totalAvailable.toLocaleString("fr-FR")} €
              </p>
              <p className="text-xs text-ink-faint">disponibles chez nos investisseurs</p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-brand-ink">
                {totalInvested.toLocaleString("fr-FR")} €
              </p>
              <p className="text-xs text-ink-faint">déjà investis sur des dossiers</p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-brand-ink">{fundedDossiersCount}</p>
              <p className="text-xs text-ink-faint">dossier{fundedDossiersCount > 1 ? "s" : ""} déjà signé{fundedDossiersCount > 1 ? "s" : ""}</p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-brand-ink">{verifiedInvestorsCount}</p>
              <p className="text-xs text-ink-faint">investisseur{verifiedInvestorsCount > 1 ? "s" : ""} vérifié{verifiedInvestorsCount > 1 ? "s" : ""}</p>
            </div>
          </div>
          <Button variant="ghost" href="/marketplace">Voir les offres</Button>
        </div>
      </section>

      {/* Points clés */}
      <section className="bg-surface-alt px-6 py-14 sm:px-12">
        <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_POINTS.map((f, i) => (
            <div key={f.title} className="rounded-xl border border-line bg-surface p-5">
              <div className="font-mono text-xs font-semibold text-accent">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="mt-1.5 font-display text-lg text-brand-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="comment-ca-marche" className="px-6 py-16 sm:px-12">
        <div className="mx-auto max-w-5xl">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">Comment ça marche</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
            Deux parcours, un seul principe : la confiance vérifiée.
          </h2>

          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Pour un emprunteur</h3>
              <ol className="mt-4 grid gap-4">
                {BORROWER_STEPS.map((s) => (
                  <li key={s.n} className="flex gap-3">
                    <span className="font-mono text-xs font-semibold text-accent">{s.n}</span>
                    <div>
                      <p className="font-display text-sm font-semibold text-ink">{s.title}</p>
                      <p className="text-sm text-ink-soft">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Button variant="link" href="/signup?role=BORROWER" className="mt-4 inline-block">
                Déposer une demande →
              </Button>
            </div>

            <div>
              <h3 className="font-display text-lg font-semibold text-brand-ink">Pour un investisseur</h3>
              <ol className="mt-4 grid gap-4">
                {INVESTOR_STEPS.map((s) => (
                  <li key={s.n} className="flex gap-3">
                    <span className="font-mono text-xs font-semibold text-accent">{s.n}</span>
                    <div>
                      <p className="font-display text-sm font-semibold text-ink">{s.title}</p>
                      <p className="text-sm text-ink-soft">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Button variant="link" href="/marketplace" className="mt-4 inline-block">
                Voir la marketplace →
              </Button>
            </div>
          </div>

          <div className="mt-10 rounded-xl border border-line bg-surface-alt p-5">
            <p className="font-display text-sm font-semibold text-ink">
              Besoin d&apos;aller plus vite ? Demande une mise en relation directe (15 €)
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Plutôt que d&apos;attendre, un emprunteur peut demander le contact direct d&apos;un investisseur
              (particulier, entreprise ou structure) et inversement. Une fois la demande payée, les
              coordonnées sont échangées immédiatement dans les deux sens.
            </p>
            <p className="mt-2 text-xs text-ink-faint">
              Lentific fournit le contact ; ce qui se passe ensuite entre les deux parties a lieu hors de la
              plateforme et n&apos;engage pas notre responsabilité.
            </p>
          </div>
        </div>
      </section>

      {/* Aperçu marketplace */}
      <section className="bg-surface-alt px-6 py-16 sm:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">Marketplace</p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
                Des dossiers déjà vérifiés, prêts à être financés
              </h2>
            </div>
            <Button variant="ghost" href="/marketplace" className="hidden sm:inline-block">
              Tout voir
            </Button>
          </div>

          {preview.length === 0 ? (
            <Card className="mt-6">
              <p className="text-sm text-ink-soft">
                Aucune opportunité ouverte pour l&apos;instant, le premier dossier signé apparaîtra ici
                automatiquement.
              </p>
            </Card>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {preview.map((opp) => {
                const funded = Number(opp.fundedAmount);
                const target = Number(opp.targetAmount);
                const pct = target > 0 ? Math.min(100, Math.round((funded / target) * 100)) : 0;
                return (
                  <Card key={opp.id}>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-base text-ink">{opp.loan.offer.application.purpose}</h3>
                      <StatusPill tone={opp.riskLevel === "high" ? "risk" : opp.riskLevel === "low" ? "ok" : "pending"}>
                        Risque {RISK_LABEL[opp.riskLevel] ?? opp.riskLevel}
                      </StatusPill>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface">
                      <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-2 text-sm text-ink-soft">
                      {funded.toLocaleString("fr-FR")} € / {target.toLocaleString("fr-FR")} € financés ({pct}%)
                    </p>
                  </Card>
                );
              })}
            </div>
          )}
          <Button variant="ghost" href="/marketplace" className="mt-4 inline-block sm:hidden">
            Tout voir
          </Button>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 py-16 text-center sm:px-12">
        <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Prêt à commencer ?</h2>
        <p className="mx-auto mt-2 max-w-xl text-ink-soft">
          Crée un compte en moins de deux minutes, que tu cherches un financement ou que tu veuilles investir.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="primary" href="/signup?role=BORROWER">Déposer une demande</Button>
          <Button variant="ghost" href="/signup?role=INVESTOR">Devenir investisseur</Button>
        </div>
      </section>

      <footer className="border-t border-line px-6 py-8 text-sm text-ink-faint sm:px-12">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Lentific · Plateforme de financement participatif.</span>
          <div className="flex gap-4">
            <a href="/marketplace" className="hover:text-ink">Marketplace</a>
            <a href="/simulateur" className="hover:text-ink">Simulateur</a>
            <a href="/login" className="hover:text-ink">Connexion</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
