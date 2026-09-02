import { redirect } from "next/navigation";
import { prisma } from "@fintech/database";
import { Card } from "@fintech/ui";
import { getCurrentUser } from "../../../../lib/session";

const EVENT_LABEL: Record<string, string> = {
  "funding.match_alert": "Un nouveau dossier correspond à ta tolérance au risque",
  "introduction.paid": "Quelqu'un a payé pour obtenir ton contact",
  "investor.verified": "Ton profil investisseur a été vérifié",
  "investor.rejected": "Ta vérification investisseur a été rejetée",
  "document.requested": "Un document t'a été demandé",
};

export default async function InvestorNotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">apps/web · (investor)</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Mes alertes</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Les alertes automatiques sur les nouveaux dossiers correspondant à ton profil sont réservées aux
        investisseurs Premium.
      </p>

      {notifications.length === 0 ? (
        <Card className="mt-6">
          <p className="text-sm text-ink-soft">Aucune alerte pour l&apos;instant.</p>
        </Card>
      ) : (
        <div className="mt-6 grid gap-2">
          {notifications.map((n) => (
            <Card key={n.id}>
              <p className="text-sm text-ink">{EVENT_LABEL[n.event] ?? n.event}</p>
              <p className="mt-1 text-xs text-ink-faint">{n.createdAt.toLocaleString("fr-FR")}</p>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
