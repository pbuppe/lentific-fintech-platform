import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@fintech/database";
import { confirmVerification, rejectVerification } from "@fintech/kyc";
import { getFileUrl } from "@fintech/documents";
import { Card, StatusPill } from "@fintech/ui";

/**
 * File d'attente de vérification d'identité manuelle. Un dossier apparaît
 * ici tant que ses documents d'identité sont au statut UPLOADED : l'agent
 * contacte le client, vérifie la pièce, puis confirme ou rejette.
 */
async function getPendingIdentityDocuments() {
  return prisma.document.findMany({
    where: { status: "UPLOADED", type: "identity" },
    include: { owner: true },
    orderBy: { id: "desc" },
  });
}

async function confirmAction(formData: FormData) {
  "use server";
  const userId = formData.get("userId") as string;
  const documentId = formData.get("documentId") as string;
  const applicationId = formData.get("applicationId") as string;
  await confirmVerification(userId, [documentId], "agent-demo", applicationId);
  revalidatePath("/kyc");
  revalidatePath("/");
}

async function rejectAction(formData: FormData) {
  "use server";
  const userId = formData.get("userId") as string;
  const documentId = formData.get("documentId") as string;
  const applicationId = formData.get("applicationId") as string;
  await rejectVerification(userId, [documentId], "agent-demo", "Pièce illisible ou expirée", applicationId);
  revalidatePath("/kyc");
  revalidatePath("/");
}

export default async function KycQueuePage() {
  const t = await getTranslations("KycPage");
  const documents = await getPendingIdentityDocuments().catch(() => []);
  const urlByDocument = new Map<string, string>();
  for (const doc of documents) {
    urlByDocument.set(doc.id, await getFileUrl(doc.storageKey));
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">
        {t("kicker")}
      </p>
      <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-lg text-sm text-ink-soft">
        {t("description")}
      </p>

      <div className="mt-6 grid gap-3">
        {documents.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-soft">{t("empty")}</p>
          </Card>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id} accented>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-base text-ink">{doc.owner.email}</p>
                  <a
                    href={urlByDocument.get(doc.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-brand-ink underline"
                  >
                    {doc.storageKey}
                  </a>
                </div>
                <StatusPill tone="pending">{t("pendingContact")}</StatusPill>
              </div>
              <div className="mt-3 flex gap-2">
                <form action={confirmAction}>
                  <input type="hidden" name="userId" value={doc.ownerId} />
                  <input type="hidden" name="documentId" value={doc.id} />
                  <input type="hidden" name="applicationId" value={doc.applicationId ?? ""} />
                  <button
                    className="rounded-lg bg-yellow px-3.5 py-2 text-xs font-semibold text-ink hover:bg-yellow-ink disabled:opacity-50"
                    disabled={!doc.applicationId}
                  >
                    {t("confirmVerification")}
                  </button>
                </form>
                <form action={rejectAction}>
                  <input type="hidden" name="userId" value={doc.ownerId} />
                  <input type="hidden" name="documentId" value={doc.id} />
                  <input type="hidden" name="applicationId" value={doc.applicationId ?? ""} />
                  <button
                    className="rounded-lg border border-line px-3.5 py-2 text-xs font-semibold text-accent disabled:opacity-50"
                    disabled={!doc.applicationId}
                  >
                    {t("reject")}
                  </button>
                </form>
              </div>
              {!doc.applicationId && (
                <p className="mt-2 text-xs text-accent">
                  {t("noApplicationNote")}
                </p>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
