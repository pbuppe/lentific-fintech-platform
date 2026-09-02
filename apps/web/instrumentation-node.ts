/**
 * Enregistrement des handlers d'événements, isolé dans son propre fichier,
 * importé dynamiquement uniquement côté Node par instrumentation.ts. Next.js
 * a besoin de cette frontière nette (un seul point d'import paresseux) pour
 * ne PAS essayer de compiler ce module (et son usage de fs/path via
 * @fintech/documents) pour le runtime Edge du middleware : un simple `if`
 * dans le même fichier ne suffit pas, webpack résout quand même les imports
 * dynamiques qu'il contient pour les deux cibles.
 */
const SCHEDULER_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes, pour rester démontrable en session de démo

export async function registerNodeHandlers() {
  const [{ checkSlaBreaches }] = await Promise.all([
    import("@fintech/applications"),
    import("@fintech/kyc"),
    import("@fintech/loans"),
    import("@fintech/contracts"),
    import("@fintech/signatures"),
    import("@fintech/notifications"),
    import("@fintech/funding"),
  ]);
  console.log(
    "[instrumentation] handlers workflow enregistrés (applications, kyc, loans, contracts, signatures, notifications, funding)"
  );

  startScheduler(checkSlaBreaches);
}

/**
 * Planificateur en arrière-plan (facturation récurrente + relance SLA) : ne
 * tourne que dans ce process (apps/web), jamais dans apps/admin, pour ne pas
 * prélever ou relancer deux fois le même abonnement/dossier depuis deux
 * processus Node séparés. Protégé par globalThis contre le hot-reload de
 * Next.js en dev, qui recharge sinon ce module (et empilerait les intervalles)
 * à chaque modification de fichier.
 */
function startScheduler(checkSlaBreaches: () => Promise<number>) {
  const globalForScheduler = globalThis as unknown as { lentificSchedulerStarted?: boolean };
  if (globalForScheduler.lentificSchedulerStarted) return;
  globalForScheduler.lentificSchedulerStarted = true;

  const tick = async () => {
    try {
      const { prisma } = await import("@fintech/database");
      const { processDueSubscriptions } = await import("@fintech/payments");
      const eur = await prisma.currency.findUnique({ where: { code: "EUR" } });
      if (eur) {
        const renewed = await processDueSubscriptions(eur.id);
        if (renewed > 0) console.log(`[scheduler] ${renewed} abonnement(s) traité(s)`);
      }
      const breached = await checkSlaBreaches();
      if (breached > 0) console.log(`[scheduler] ${breached} dossier(s) prioritaire(s) relancé(s) (SLA dépassé)`);
    } catch (error) {
      console.error("[scheduler] échec du balayage périodique", error);
    }
  };

  setInterval(tick, SCHEDULER_INTERVAL_MS);
  void tick(); // premier passage immédiat au démarrage, sans attendre le premier intervalle
}
