import { revalidatePath } from "next/cache";
import { confirmVerification, rejectVerification, listPendingVerifications } from "@fintech/investors";
import { getFileUrl } from "@fintech/documents";
import { Card, StatusPill } from "@fintech/ui";

async function confirmAction(formData: FormData) {
  "use server";
  const userId = formData.get("userId") as string;
  const documentIds = (formData.get("documentIds") as string).split(",").filter(Boolean);
  await confirmVerification(userId, documentIds, "agent-demo");
  revalidatePath("/investisseurs");
}

async function rejectAction(formData: FormData) {
  "use server";
  const userId = formData.get("userId") as string;
  const documentIds = (formData.get("documentIds") as string).split(",").filter(Boolean);
  await rejectVerification(userId, documentIds, "agent-demo", "Justificatifs illisibles ou insuffisants, à redéposer");
  revalidatePath("/investisseurs");
}

export default async function InvestorVerificationQueuePage() {
  const pending = await listPendingVerifications().catch(() => []);

  const rows = await Promise.all(
    pending.map(async (profile) => {
      const incomeDoc = profile.user.documents.find((d) => d.type === "proof_of_income" && d.status === "UPLOADED");
      const fundsDoc = profile.user.documents.find((d) => d.type === "proof_of_funds" && d.status === "UPLOADED");
      return {
        profile,
        incomeDoc,
        fundsDoc,
        incomeUrl: incomeDoc ? await getFileUrl(incomeDoc.storageKey) : null,
        fundsUrl: fundsDoc ? await getFileUrl(fundsDoc.storageKey) : null,
      };
    })
  );

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">
        apps/admin · vérification manuelle
      </p>
      <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
        Vérification des investisseurs : à traiter
      </h1>
      <p className="mt-3 max-w-lg text-sm text-ink-soft">
        Examine le justificatif de revenus et le justificatif de disponibilité des fonds, puis confirme ou
        rejette ci-dessous.
      </p>

      <div className="mt-6 grid gap-3">
        {rows.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-soft">Aucun investisseur en attente de vérification.</p>
          </Card>
        ) : (
          rows.map(({ profile, incomeDoc, fundsDoc, incomeUrl, fundsUrl }) => {
            const documentIds = [incomeDoc?.id, fundsDoc?.id].filter(Boolean).join(",");
            const complete = Boolean(incomeDoc && fundsDoc);
            return (
              <Card key={profile.id} accented>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-base text-ink">{profile.user.name ?? profile.user.email}</p>
                    <p className="text-xs text-ink-faint">{profile.user.email}</p>
                  </div>
                  <StatusPill tone="pending">En attente</StatusPill>
                </div>

                <div className="mt-3 grid gap-1.5 text-sm">
                  <p>
                    Justificatif de revenus :{" "}
                    {incomeUrl ? (
                      <a href={incomeUrl} target="_blank" rel="noreferrer" className="text-brand-ink underline">
                        {incomeDoc?.storageKey}
                      </a>
                    ) : (
                      <span className="text-accent">manquant</span>
                    )}
                  </p>
                  <p>
                    Justificatif de disponibilité des fonds :{" "}
                    {fundsUrl ? (
                      <a href={fundsUrl} target="_blank" rel="noreferrer" className="text-brand-ink underline">
                        {fundsDoc?.storageKey}
                      </a>
                    ) : (
                      <span className="text-accent">manquant</span>
                    )}
                  </p>
                </div>

                <div className="mt-3 flex gap-2">
                  <form action={confirmAction}>
                    <input type="hidden" name="userId" value={profile.userId} />
                    <input type="hidden" name="documentIds" value={documentIds} />
                    <button
                      className="rounded-lg bg-yellow px-3.5 py-2 text-xs font-semibold text-ink hover:bg-yellow-ink disabled:opacity-50"
                      disabled={!complete}
                    >
                      Confirmer la vérification
                    </button>
                  </form>
                  <form action={rejectAction}>
                    <input type="hidden" name="userId" value={profile.userId} />
                    <input type="hidden" name="documentIds" value={documentIds} />
                    <button className="rounded-lg border border-line px-3.5 py-2 text-xs font-semibold text-accent">
                      Rejeter
                    </button>
                  </form>
                </div>
                {!complete && (
                  <p className="mt-2 text-xs text-accent">
                    Il manque un justificatif : impossible de confirmer tant que les deux ne sont pas déposés.
                  </p>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
