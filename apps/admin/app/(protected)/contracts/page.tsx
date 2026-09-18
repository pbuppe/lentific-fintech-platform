import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma, fundingRepo } from "@fintech/database";
import { confirmSignature, rejectSignature } from "@fintech/signatures";
import { getFileUrl } from "@fintech/documents";
import { regenerateAsBilateralContract } from "@fintech/contracts";
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

async function regenerateBilateralAction(formData: FormData) {
  "use server";
  const loanId = formData.get("loanId") as string;
  await regenerateAsBilateralContract(loanId);
  revalidatePath("/contracts");
}

export default async function ContractsQueuePage() {
  const t = await getTranslations("ContractsPage");
  const signatures = await getPendingSignatures().catch(() => []);
  const scanUrlBySignature = new Map<string, string>();
  for (const sig of signatures) {
    const scan = await findUploadedScan(sig.contractId);
    if (scan) scanUrlBySignature.set(sig.id, await getFileUrl(scan.storageKey));
  }

  // § demande produit 2026-09-18 : prêts marketplace financés par un seul
  // investisseur, éligibles à une régénération en contrat bilatéral direct.
  const singleInvestorLoans = await fundingRepo.listSingleInvestorOpportunities().catch(() => []);

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
        {signatures.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-soft">{t("empty")}</p>
          </Card>
        ) : (
          signatures.map((sig) => (
            <Card key={sig.id} accented>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-base text-ink">{t("contractLabel", { id: sig.contractId.slice(0, 8) })}</p>
                  {scanUrlBySignature.has(sig.id) ? (
                    <a
                      href={scanUrlBySignature.get(sig.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs text-brand-ink underline"
                    >
                      {t("viewSignedContract")}
                    </a>
                  ) : (
                    <p className="font-mono text-xs text-ink-faint">{sig.contract.storageKey}</p>
                  )}
                </div>
                <StatusPill tone="pending">{t("pendingVerification")}</StatusPill>
              </div>
              <div className="mt-3 flex gap-2">
                <form action={confirmAction}>
                  <input type="hidden" name="signatureId" value={sig.id} />
                  <input type="hidden" name="contractId" value={sig.contractId} />
                  <button className="rounded-lg bg-yellow px-3.5 py-2 text-xs font-semibold text-ink hover:bg-yellow-ink">
                    {t("confirmSignature")}
                  </button>
                </form>
                <form action={rejectAction}>
                  <input type="hidden" name="signatureId" value={sig.id} />
                  <button className="rounded-lg border border-line px-3.5 py-2 text-xs font-semibold text-accent">
                    {t("reject")}
                  </button>
                </form>
              </div>
            </Card>
          ))
        )}
      </div>

      {singleInvestorLoans.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-lg font-semibold text-ink">{t("bilateralEligibleTitle")}</h2>
          <p className="mt-1 max-w-lg text-sm text-ink-soft">{t("bilateralEligibleDescription")}</p>
          <div className="mt-4 grid gap-3">
            {singleInvestorLoans.map(({ loan, investor }) => (
              <Card key={loan.id}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-base text-ink">{loan.offer.application.reference}</p>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      {t("bilateralEligibleMeta", {
                        borrower: loan.offer.application.borrower.name ?? loan.offer.application.borrower.email,
                        lender: investor.name ?? investor.email,
                      })}
                    </p>
                  </div>
                  <form action={regenerateBilateralAction}>
                    <input type="hidden" name="loanId" value={loan.id} />
                    <button className="rounded-lg border border-line px-3.5 py-2 text-xs font-semibold text-ink-soft hover:bg-surface-alt">
                      {t("regenerateBilateral")}
                    </button>
                  </form>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
