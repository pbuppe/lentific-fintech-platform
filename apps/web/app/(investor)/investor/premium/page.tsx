import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma, subscriptionsRepo } from "@fintech/database";
import { subscribe, cancelSubscription } from "@fintech/payments";
import { Card, StatusPill } from "@fintech/ui";
import { getCurrentUser } from "../../../../lib/session";

const TIER = "INVESTOR_PREMIUM";
const MONTHLY_AMOUNT = 15;

async function subscribeAction() {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const eur = await prisma.currency.findUniqueOrThrow({ where: { code: "EUR" } });
  await subscribe(user.id, TIER, MONTHLY_AMOUNT, eur.id);
  revalidatePath("/investor/premium");
}

async function cancelAction() {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await cancelSubscription(user.id);
  revalidatePath("/investor/premium");
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Actif",
  CANCELLED: "Résilié",
  PAST_DUE: "Paiement échoué",
};

export default async function InvestorPremiumPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const subscription = await subscriptionsRepo.findForUser(user.id);
  const isActive = subscription?.status === "ACTIVE";
  const willRenew = isActive && !subscription?.cancelledAt;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">apps/web · (investor)</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Formule Premium</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {MONTHLY_AMOUNT}&nbsp;€ / mois, résiliable à tout moment. Rentabilisé dès la deuxième mise en relation
        du mois (15&nbsp;€ à l&apos;unité sinon).
      </p>

      {subscription && (
        <div className="mt-4">
          <StatusPill tone={isActive ? "ok" : "pending"}>{STATUS_LABEL[subscription.status] ?? subscription.status}</StatusPill>
          {isActive && (
            <p className="mt-2 text-xs text-ink-faint">
              {willRenew
                ? `Renouvellement automatique le ${subscription.currentPeriodEnd.toLocaleDateString("fr-FR")}.`
                : `Résilié : reste actif jusqu'au ${subscription.currentPeriodEnd.toLocaleDateString("fr-FR")}, puis s'arrête sans nouveau prélèvement.`}
            </p>
          )}
        </div>
      )}

      <Card className="mt-6">
        <p className="font-display text-sm font-semibold text-ink">Ce que ça change</p>
        <ul className="mt-3 grid gap-2 text-sm text-ink-soft">
          <li>→ Mises en relation <strong className="text-ink">illimitées</strong> avec des emprunteurs, sans les 15&nbsp;€ à l&apos;unité</li>
          <li>→ <strong className="text-ink">Alerte automatique</strong> dès qu&apos;un nouveau dossier correspond à ta tolérance au risque</li>
          <li>→ <strong className="text-ink">Vérification accélérée</strong> sous 48h</li>
          <li>→ Badge <strong className="text-ink">Premium</strong> affiché en plus du badge Vérifié</li>
          <li>→ Tableau de bord de performance avancé (rendement, taux de défaut, historique)</li>
        </ul>

        <div className="mt-5">
          {isActive ? (
            willRenew ? (
              <form action={cancelAction}>
                <button className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink-soft hover:bg-surface-alt">
                  Résilier mon abonnement
                </button>
              </form>
            ) : (
              <form action={subscribeAction}>
                <button className="rounded-lg bg-yellow px-4 py-2.5 text-sm font-semibold text-ink hover:bg-yellow-ink">
                  Réactiver l&apos;abonnement
                </button>
              </form>
            )
          ) : (
            <form action={subscribeAction}>
              <button className="rounded-lg bg-yellow px-4 py-2.5 text-sm font-semibold text-ink hover:bg-yellow-ink">
                Passer Premium (15&nbsp;€ simulés maintenant)
              </button>
            </form>
          )}
        </div>
      </Card>
    </main>
  );
}
