import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { listBorrowerApplications, acceptOffer } from "@fintech/applications";
import { uploadDocument, listMyDocumentRequests } from "@fintech/documents";
import { submitSignedContract, getSignatureForContract } from "@fintech/signatures";
import { recordPriorityFee } from "@fintech/payments";
import { contractsRepo, prisma } from "@fintech/database";
import { getContractDownloadUrl } from "@fintech/contracts";
import { Card, StatusPill } from "@fintech/ui";
import { getCurrentUser } from "../../../lib/session";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Brouillon",
  SUBMITTED: "Demande envoyée",
  KYC_PENDING: "Identité en attente de vérification",
  KYC_VERIFIED: "Identité vérifiée",
  UNDER_REVIEW: "Analyse en cours",
  PUBLISHED: "Offre disponible",
  OFFER_ACCEPTED: "Offre acceptée",
  CONTRACT_SIGNED: "Contrat signé",
  DISBURSED: "Fonds versés",
  REJECTED: "Refusée",
  CANCELLED: "Annulée",
};

async function uploadIdentityAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const applicationId = formData.get("applicationId") as string;
  const file = formData.get("identityDoc") as File;
  if (!file || file.size === 0) redirect(`/dashboard?error=${encodeURIComponent("Choisis un fichier avant d'envoyer.")}`);

  const content = Buffer.from(await file.arrayBuffer());
  await uploadDocument({ ownerId: user.id, applicationId, type: "identity", fileName: file.name, content });
  revalidatePath("/dashboard");
}

const PRIORITY_FEE = 49;
const PRIORITY_ELIGIBLE_STATUSES = ["SUBMITTED", "KYC_PENDING", "KYC_VERIFIED", "UNDER_REVIEW"];

async function requestPriorityAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const applicationId = formData.get("applicationId") as string;
  const eur = await prisma.currency.findUniqueOrThrow({ where: { code: "EUR" } });
  await recordPriorityFee(user.id, applicationId, PRIORITY_FEE, eur.id);
  revalidatePath("/dashboard");
}

async function acceptOfferAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const offerId = formData.get("offerId") as string;
  await acceptOffer(offerId, user.id);
  revalidatePath("/dashboard");
}

async function uploadSignedContractAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const applicationId = formData.get("applicationId") as string;
  const signatureId = formData.get("signatureId") as string;
  const contractId = formData.get("contractId") as string;
  const file = formData.get("signedContract") as File;
  if (!file || file.size === 0) redirect(`/dashboard?error=${encodeURIComponent("Choisis un fichier avant d'envoyer.")}`);

  const content = Buffer.from(await file.arrayBuffer());
  await submitSignedContract({
    signatureId,
    contractId,
    ownerId: user.id,
    applicationId,
    fileName: file.name,
    content,
  });
  revalidatePath("/dashboard");
}

export default async function BorrowerDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [applications, documentRequests] = await Promise.all([
    listBorrowerApplications(user.id),
    listMyDocumentRequests(user.id),
  ]);
  const pendingDocumentRequests = documentRequests.filter((r) => r.status === "PENDING");

  // Retrouve, pour chaque demande dont l'offre a été acceptée, la signature en
  // attente (le contrat n'a pas de relation Prisma directe vers Loan, voir
  // packages/applications getApplicationDetail pour la même traversée).
  const signatureByApplication = new Map<string, string>();
  const contractUrlByApplication = new Map<string, string>();
  for (const app of applications) {
    const contractId = app.offers.find((o) => o.status === "ACCEPTED")?.loan?.contractId;
    if (!contractId) continue;
    const signature = await getSignatureForContract(contractId);
    if (signature) signatureByApplication.set(app.id, signature.id);
    const contract = await contractsRepo.findById(contractId);
    if (contract) contractUrlByApplication.set(app.id, await getContractDownloadUrl(contract.storageKey));
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">apps/web · (borrower)</p>
        <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
          Espace emprunteur
        </h1>
      </div>

      {pendingDocumentRequests.length > 0 && (
        <a
          href="/documents"
          className="mb-6 flex items-center justify-between rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent hover:opacity-90"
        >
          <span>
            <span className="font-semibold">
              {pendingDocumentRequests.length} document{pendingDocumentRequests.length > 1 ? "s" : ""}
            </span>{" "}
            demandé{pendingDocumentRequests.length > 1 ? "s" : ""} par notre équipe ({pendingDocumentRequests.map((r) => r.label).join(", ")}).
          </span>
          <span className="whitespace-nowrap font-semibold underline">Envoyer →</span>
        </a>
      )}

      {applications.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-soft">
            Aucune demande pour l&apos;instant.{" "}
            <a href="/demande" className="text-brand-ink underline">
              Dépose ta première demande
            </a>
            .
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => {
            const identityDoc = app.documents.find((d) => d.type === "identity");
            const identityNeedsUpload =
              (app.status === "SUBMITTED" || app.status === "KYC_PENDING") &&
              (!identityDoc || identityDoc.status === "REJECTED");
            const publishedOffer = app.offers.find((o) => o.status === "PENDING");
            const acceptedOffer = app.offers.find((o) => o.status === "ACCEPTED");
            const signedContractDoc = app.documents.find((d) => d.type === "signed_contract");
            const needsSignatureUpload = app.status === "OFFER_ACCEPTED" && !signedContractDoc && acceptedOffer?.loan;

            return (
              <Card key={app.id} accented>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg text-ink">{app.reference}</h3>
                  <StatusPill tone={app.status === "REJECTED" ? "risk" : app.status === "CONTRACT_SIGNED" || app.status === "DISBURSED" ? "ok" : "pending"}>
                    {STATUS_LABEL[app.status] ?? app.status}
                  </StatusPill>
                </div>
                <p className="mt-1 text-sm text-ink-soft">
                  {Number(app.amount).toLocaleString("fr-FR")} € · {app.durationMonths} mois · {app.purpose}
                </p>

                {app.priority ? (
                  <p className="mt-2 text-xs font-semibold text-yellow-ink">
                    ★ Dossier prioritaire
                    {app.slaBreachedAt
                      ? " — SLA de 48h dépassé, une relance a été envoyée à notre équipe."
                      : app.slaDeadline
                        ? ` — revue garantie avant le ${app.slaDeadline.toLocaleString("fr-FR")}.`
                        : ""}
                  </p>
                ) : (
                  PRIORITY_ELIGIBLE_STATUSES.includes(app.status) && (
                    <form action={requestPriorityAction} className="mt-3">
                      <input type="hidden" name="applicationId" value={app.id} />
                      <button className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-yellow hover:text-yellow-ink">
                        Passer en dossier prioritaire ({PRIORITY_FEE} €, revue sous 48h)
                      </button>
                    </form>
                  )
                )}

                {identityNeedsUpload && (
                  <form action={uploadIdentityAction} className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-surface-alt p-3">
                    <input type="hidden" name="applicationId" value={app.id} />
                    <span className="text-xs text-ink-soft">
                      {identityDoc?.status === "REJECTED"
                        ? "Pièce refusée, envoie un nouveau document :"
                        : "Envoie une pièce d'identité pour continuer :"}
                    </span>
                    <input type="file" name="identityDoc" required className="text-xs" />
                    <button className="rounded-lg bg-yellow px-3 py-1.5 text-xs font-semibold text-ink hover:bg-yellow-ink">
                      Envoyer
                    </button>
                  </form>
                )}

                {!identityNeedsUpload && identityDoc?.status === "UPLOADED" && (
                  <p className="mt-3 text-xs text-ink-faint">Pièce d&apos;identité envoyée, en attente de vérification par un agent.</p>
                )}

                {publishedOffer && (
                  <div className="mt-3 rounded-lg bg-brand-soft p-3">
                    <p className="text-sm text-brand-ink">
                      Offre proposée : {Number(publishedOffer.amount).toLocaleString("fr-FR")} € sur{" "}
                      {publishedOffer.durationMonths} mois, taux {Number(publishedOffer.rate)}%
                    </p>
                    <form action={acceptOfferAction} className="mt-2">
                      <input type="hidden" name="offerId" value={publishedOffer.id} />
                      <button className="rounded-lg bg-yellow px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-yellow-ink">
                        Accepter l&apos;offre
                      </button>
                    </form>
                  </div>
                )}

                {needsSignatureUpload && acceptedOffer?.loan && (
                  <div className="mt-3 rounded-lg bg-surface-alt p-3">
                    {contractUrlByApplication.has(app.id) && (
                      <a
                        href={contractUrlByApplication.get(app.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-brand-ink underline"
                      >
                        Télécharger mon contrat (PDF)
                      </a>
                    )}
                    <form action={uploadSignedContractAction} className="mt-2 flex flex-wrap items-center gap-2">
                      <input type="hidden" name="applicationId" value={app.id} />
                      <input type="hidden" name="signatureId" value={signatureByApplication.get(app.id) ?? ""} />
                      <input type="hidden" name="contractId" value={acceptedOffer.loan.contractId ?? ""} />
                      <span className="text-xs text-ink-soft">
                        Imprime-le, signe-le à la main, puis envoie une photo/scan :
                      </span>
                      <input type="file" name="signedContract" required className="text-xs" />
                      <button className="rounded-lg bg-yellow px-3 py-1.5 text-xs font-semibold text-ink hover:bg-yellow-ink">
                        Envoyer
                      </button>
                    </form>
                  </div>
                )}

                {signedContractDoc && app.status === "OFFER_ACCEPTED" && (
                  <p className="mt-3 text-xs text-ink-faint">Contrat signé envoyé, en attente de vérification par un agent.</p>
                )}

                {app.status === "CONTRACT_SIGNED" && (
                  <p className="mt-3 text-xs text-success">
                    Contrat confirmé signé : ton financement est maintenant proposé aux investisseurs.
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
