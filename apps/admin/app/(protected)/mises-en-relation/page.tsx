import { redirect } from "next/navigation";
import { prisma } from "@fintech/database";
import { Card, StatusPill } from "@fintech/ui";
import { getCurrentUser } from "../../../lib/session";

const ADMIN_ROLES = ["AGENT", "ADMIN", "SUPER_ADMIN"];

export default async function AdminIntroductionsPage() {
  const user = await getCurrentUser();
  if (!user || !ADMIN_ROLES.includes(user.role)) redirect("/login");

  const introductions = await prisma.introductionRequest.findMany({
    where: { status: "PAID" },
    include: { requester: true, targetUser: true },
    orderBy: { paidAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">apps/admin · vue d&apos;ensemble</p>
      <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
        Profils mis en relation
      </h1>
      <p className="mt-3 max-w-lg text-sm text-ink-soft">
        Liste des paires ayant échangé leurs coordonnées via une mise en relation payée. À partir de ce
        moment, ce qui se passe entre les deux parties a lieu hors de la plateforme, Lentific n&apos;en est
        pas responsable, seul le contact a été fourni.
      </p>

      <div className="mt-6 grid gap-3">
        {introductions.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-soft">Aucune mise en relation payée pour l&apos;instant.</p>
          </Card>
        ) : (
          introductions.map((r) => (
            <Card key={r.id}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-ink">
                  <span className="font-semibold">{r.requester.name ?? r.requester.email}</span>
                  {" → "}
                  <span className="font-semibold">{r.targetUser.name ?? r.targetUser.email}</span>
                </p>
                <StatusPill tone="ok">Payée</StatusPill>
              </div>
              <p className="mt-1 text-xs text-ink-faint">
                {r.targetType === "APPLICATION" ? "Investisseur vers emprunteur" : "Emprunteur vers investisseur"}{" "}
                · {r.paidAt?.toLocaleDateString("fr-FR")}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
