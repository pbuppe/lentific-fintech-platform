import { revalidatePath } from "next/cache";
import { prisma } from "@fintech/database";
import { confirmSignature, rejectSignature } from "@fintech/signatures";
import { getFileUrl } from "@fintech/documents";
import { Card, StatusPill } from "@fintech/ui";

/** Retrouve le scan déposé par le client pour ce contrat (contrat → prêt → offre → demande → document). */
async function findUploadedScan(contractId: string) {
  const contract = await prisma.contract.findUnique({ where: { id: contractId } });
  if (!contract) return null;
  const loan = await prisma.loan.findUnique({ where: { id: contract.loanId } });
  if (!loan) return null;
  const offer = await prisma.offer.findUnique({ where: { id: loan.offerId } });
  if (!offer) return null;
  return prisma.document.findFirst({
    where: { applicationId: offer.applicationId, type: "signed_contract" },
    orderBy: { id: "desc" },
  });
}

/**
 * File d'attente des contrats signés à la main puis uploadés par le client.
 * Un agent ouvre le document scanné (lien signé, à implémenter avec le vrai
 * stockage), vérifie que la signature est bien présente, puis confirme.
 */
async function getPendingSignatures() {
  return prisma.signature.findMany({
    where: { status: "PENDING" },
    include: { contract: true },
    orderBy: { id: "desc" },
  });
}

async function confirmAction(formData: FormData) {
  "use server";
  const signatureId = formData.get("signatureId") as string;
  const contractId = formData.get("contractId") as string;
  await confirmSignature(signatureId, contractId, "agent-demo");
  revalidatePath("/contracts");
  revalidatePath("/");
}

async function rejectAction(formData: FormData) {
  "use server";
  const signatureId = formData.get("signatureId") as string;
  await rejectSignature(signatureId, "agent-demo", "Signature absente ou illisible sur le document uploadé");
  revalidatePath("/contracts");
  revalidatePath("/");
}

export default async function ContractsQueuePage() {
  const signatures = await getPendingSignatures().catch(() => []);
  const scanUrlBySignature = new Map<string, string>();
  for (const sig of signatures) {
    const scan = await findUploadedScan(sig.contractId);
    if (scan) scanUrlBySignature.set(sig.id, await getFileUrl(scan.storageKey));
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">
        apps/admin · signature manuelle
      </p>
      <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
        Contrats signés : à vérifier
      </h1>
      <p className="mt-3 max-w-lg text-sm text-ink-soft">
        Le client a imprimé, signé à la main et uploadé son contrat. Vérifie la pièce avant de confirmer.
      </p>

      <div className="mt-6 grid gap-3">
        {signatures.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-soft">Aucun contrat en attente de vérification.</p>
          </Card>
        ) : (
          signatures.map((sig) => (
            <Card key={sig.id} accented>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-base text-ink">Contrat {sig.contractId.slice(0, 8)}</p>
                  {scanUrlBySignature.has(sig.id) ? (
                    <a
                      href={scanUrlBySignature.get(sig.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs text-brand-ink underline"
                    >
                      Voir le contrat signé déposé par le client
                    </a>
                  ) : (
                    <p className="font-mono text-xs text-ink-faint">{sig.contract.storageKey}</p>
                  )}
                </div>
                <StatusPill tone="pending">En attente de vérification</StatusPill>
              </div>
              <div className="mt-3 flex gap-2">
                <form action={confirmAction}>
                  <input type="hidden" name="signatureId" value={sig.id} />
                  <input type="hidden" name="contractId" value={sig.contractId} />
                  <button className="rounded-lg bg-yellow px-3.5 py-2 text-xs font-semibold text-ink hover:bg-yellow-ink">
                    Confirmer la signature
                  </button>
                </form>
                <form action={rejectAction}>
                  <input type="hidden" name="signatureId" value={sig.id} />
                  <button className="rounded-lg border border-line px-3.5 py-2 text-xs font-semibold text-accent">
                    Rejeter
                  </button>
                </form>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
