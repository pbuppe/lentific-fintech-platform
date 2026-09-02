import { redirect } from "next/navigation";
import { usersRepo } from "@fintech/database";
import { Card, StatusPill } from "@fintech/ui";
import { getCurrentUser } from "../../../lib/session";

export default async function ComptesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") redirect("/");

  const accounts = await usersRepo.listAccounts();

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">
        apps/admin · super administrateur
      </p>
      <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
        Comptes
      </h1>
      <p className="mt-3 max-w-lg text-sm text-ink-soft">
        Vue complète sur chaque compte emprunteur ou investisseur : profil, documents, demandes de pièces,
        mises en relation.
      </p>

      <div className="mt-6 grid gap-2">
        {accounts.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-soft">Aucun compte pour l&apos;instant.</p>
          </Card>
        ) : (
          accounts.map((account) => (
            <a key={account.id} href={`/comptes/${account.id}`}>
              <Card className="flex items-center justify-between transition hover:border-brand">
                <div>
                  <p className="font-display text-base text-ink">{account.name ?? account.email}</p>
                  <p className="text-xs text-ink-faint">{account.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {account.role === "INVESTOR" && account.investorProfile?.verificationStatus === "VERIFIED" && (
                    <StatusPill tone="ok">Vérifié</StatusPill>
                  )}
                  <StatusPill tone="pending">{account.role === "BORROWER" ? "Emprunteur" : "Investisseur"}</StatusPill>
                </div>
              </Card>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
