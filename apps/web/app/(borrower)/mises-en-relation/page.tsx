import { redirect } from "next/navigation";
import { listSentBy, listReceivedBy } from "@fintech/introductions";
import { Card } from "@fintech/ui";
import { getCurrentUser } from "../../../lib/session";

export default async function BorrowerIntroductionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [sent, received] = await Promise.all([listSentBy(user.id), listReceivedBy(user.id)]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">apps/web · (borrower)</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Mes mises en relation</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Une mise en relation payée révèle le contact dans les deux sens : toi et la personne visée pouvez vous
        écrire directement.
      </p>
      <p className="mt-2 text-xs text-ink-faint">
        À partir de là, vos échanges et tout ce que vous décidez ensemble ont lieu hors de la plateforme.
        Lentific a fourni le contact mais n&apos;est pas responsable de ce qui se passe entre vous par la suite.
      </p>

      <h2 className="mt-8 font-display text-lg text-ink">Demandes que j&apos;ai envoyées</h2>
      {sent.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">Aucune demande envoyée pour l&apos;instant.</p>
      ) : (
        <div className="mt-3 grid gap-3">
          {sent.map((r) => (
            <Card key={r.id}>
              <p className="text-sm text-ink">
                <span className="font-semibold">{r.targetUser.name ?? r.targetUser.email}</span>
                {" : "}
                {r.targetType === "INVESTOR_LISTING" ? "investisseur / prêteur" : "demandeur de crédit"}
                {r.targetUser.investorProfile?.verificationStatus === "VERIFIED" && (
                  <span className="ml-2 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                    Vérifié ✓
                  </span>
                )}
              </p>
              {r.status === "PAID" ? (
                <p className="mt-1 text-sm text-success">
                  Contact : {r.targetUser.email}
                  {r.targetUser.phone ? ` · ${r.targetUser.phone}` : ""}
                </p>
              ) : (
                <p className="mt-1 text-xs text-ink-faint">Paiement en attente.</p>
              )}
            </Card>
          ))}
        </div>
      )}

      <h2 className="mt-8 font-display text-lg text-ink">Demandes reçues</h2>
      {received.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">Personne n&apos;a encore demandé à te contacter.</p>
      ) : (
        <div className="mt-3 grid gap-3">
          {received.map((r) => (
            <Card key={r.id}>
              <p className="text-sm text-ink">
                <span className="font-semibold">{r.requester.name ?? r.requester.email}</span> souhaite être mis en
                relation avec toi.
              </p>
              {r.status === "PAID" && (
                <p className="mt-1 text-sm text-success">
                  Contact : {r.requester.email}
                  {r.requester.phone ? ` · ${r.requester.phone}` : ""}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
