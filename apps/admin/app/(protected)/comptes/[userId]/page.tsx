import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { usersRepo } from "@fintech/database";
import { requestDocument, listMyDocumentRequests, getFileUrl } from "@fintech/documents";
import { Card, StatusPill } from "@fintech/ui";
import { getCurrentUser } from "../../../../lib/session";

async function requestDocumentAction(formData: FormData) {
  "use server";
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "SUPER_ADMIN") redirect("/");

  const targetUserId = formData.get("targetUserId") as string;
  const label = formData.get("label") as string;
  const instructions = formData.get("instructions") as string;
  if (!label?.trim()) return;

  await requestDocument({ targetUserId, requestedById: admin.id, label: label.trim(), instructions: instructions?.trim() || undefined });
  revalidatePath(`/comptes/${targetUserId}`);
}

export default async function AccountDetailPage({ params }: { params: { userId: string } }) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "SUPER_ADMIN") redirect("/");
  const t = await getTranslations("AccountDetailPage");
  const REQUEST_STATUS_LABEL: Record<string, string> = {
    PENDING: t("requestStatus.pending"),
    FULFILLED: t("requestStatus.fulfilled"),
    CANCELLED: t("requestStatus.cancelled"),
  };

  const account = await usersRepo.findAccountDetail(params.userId);
  if (!account) notFound();

  const documentRequests = await listMyDocumentRequests(account.id);
  const documentUrls = new Map<string, string>();
  for (const doc of account.documents) {
    documentUrls.set(doc.id, await getFileUrl(doc.storageKey));
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <a href="/comptes" className="text-xs text-ink-faint underline">
        {t("backToAccounts")}
      </a>
      <p className="mt-3 font-mono text-xs uppercase tracking-widest text-ink-faint">
        {t("kicker")}
      </p>
      <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
        {account.name ?? account.email}
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        {account.email} · {account.phone ?? t("phoneNotProvided")} ·{" "}
        {account.role === "BORROWER" ? t("roleBorrower") : t("roleInvestor")}
      </p>

      {account.role === "BORROWER" && account.borrowerProfile && (
        <Card className="mt-6">
          <p className="font-display text-sm font-semibold text-ink">{t("financialProfileTitle")}</p>
          <p className="mt-1 text-sm text-ink-soft">
            {t("financialProfile", {
              income: Number(account.borrowerProfile.income).toLocaleString("fr-FR"),
              expenses: Number(account.borrowerProfile.expenses).toLocaleString("fr-FR"),
              debt: Number(account.borrowerProfile.existingDebt).toLocaleString("fr-FR"),
            })}
          </p>
        </Card>
      )}

      {account.role === "INVESTOR" && account.investorProfile && (
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-semibold text-ink">{t("investorProfileTitle")}</p>
            <StatusPill tone={account.investorProfile.verificationStatus === "VERIFIED" ? "ok" : account.investorProfile.verificationStatus === "REJECTED" ? "risk" : "pending"}>
              {account.investorProfile.verificationStatus}
            </StatusPill>
          </div>
          <p className="mt-1 text-sm text-ink-soft">{t("riskTolerance", { tolerance: account.investorProfile.riskTolerance })}</p>
        </Card>
      )}

      {account.role === "BORROWER" && account.applications.length > 0 && (
        <Card className="mt-4">
          <p className="font-display text-sm font-semibold text-ink">{t("applicationsTitle")}</p>
          <div className="mt-2 grid gap-1.5 text-sm text-ink-soft">
            {account.applications.map((app) => (
              <p key={app.id}>
                {app.reference} · {Number(app.amount).toLocaleString("fr-FR")} € · {app.status}
              </p>
            ))}
          </div>
        </Card>
      )}

      {account.role === "INVESTOR" && account.investorListings.length > 0 && (
        <Card className="mt-4">
          <p className="font-display text-sm font-semibold text-ink">{t("listingsTitle")}</p>
          <div className="mt-2 grid gap-1.5 text-sm text-ink-soft">
            {account.investorListings.map((listing) => (
              <p key={listing.id}>
                {Number(listing.amountAvailable).toLocaleString("fr-FR")} € · {Number(listing.preferredRate)}% ·{" "}
                {listing.status}
              </p>
            ))}
          </div>
        </Card>
      )}

      {(account.introductionsSent.length > 0 || account.introductionsReceived.length > 0) && (
        <Card className="mt-4">
          <p className="font-display text-sm font-semibold text-ink">{t("introductionsTitle")}</p>
          <p className="mt-1 text-xs text-ink-faint">
            {t("introductionsDisclaimer")}
          </p>
          <div className="mt-2 grid gap-1.5 text-sm text-ink-soft">
            {account.introductionsSent.map((r) => (
              <p key={r.id}>
                {t("introSent", { name: r.targetUser.name ?? r.targetUser.email, status: r.status })}
              </p>
            ))}
            {account.introductionsReceived.map((r) => (
              <p key={r.id}>
                {t("introReceived", { name: r.requester.name ?? r.requester.email, status: r.status })}
              </p>
            ))}
          </div>
        </Card>
      )}

      <Card className="mt-4">
        <p className="font-display text-sm font-semibold text-ink">{t("documentsTitle")}</p>
        {account.documents.length === 0 ? (
          <p className="mt-1 text-sm text-ink-soft">{t("noDocuments")}</p>
        ) : (
          <div className="mt-2 grid gap-1.5 text-sm">
            {account.documents.map((doc) => (
              <p key={doc.id}>
                <a href={documentUrls.get(doc.id)} target="_blank" rel="noreferrer" className="text-brand-ink underline">
                  {doc.type}
                </a>{" "}
                <span className="text-xs text-ink-faint">({doc.status})</span>
              </p>
            ))}
          </div>
        )}
      </Card>

      <Card className="mt-4" accented>
        <p className="font-display text-sm font-semibold text-ink">{t("requestDocumentTitle")}</p>
        <p className="mt-1 text-xs text-ink-soft">
          {t("requestDocumentHint")}
        </p>
        <form action={requestDocumentAction} className="mt-3 grid gap-3">
          <input type="hidden" name="targetUserId" value={account.id} />
          <label className="grid gap-1 text-sm text-ink-soft">
            {t("documentLabel")}
            <input
              name="label"
              required
              placeholder={t("documentPlaceholder")}
              className="rounded-lg border border-line px-3 py-2 text-ink"
            />
          </label>
          <label className="grid gap-1 text-sm text-ink-soft">
            {t("instructionsLabel")}
            <textarea
              name="instructions"
              rows={2}
              placeholder={t("instructionsPlaceholder")}
              className="rounded-lg border border-line px-3 py-2 text-ink"
            />
          </label>
          <button className="justify-self-start rounded-lg bg-yellow px-4 py-2 text-sm font-semibold text-ink hover:bg-yellow-ink">
            {t("sendRequest")}
          </button>
        </form>

        {documentRequests.length > 0 && (
          <div className="mt-4 border-t border-line pt-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">{t("alreadySentTitle")}</p>
            <div className="mt-2 grid gap-1.5 text-sm text-ink-soft">
              {documentRequests.map((r) => (
                <p key={r.id}>
                  {r.label}{" "}
                  <span className="text-xs text-ink-faint">
                    ({REQUEST_STATUS_LABEL[r.status] ?? r.status}
                    {r.instructions ? `, ${r.instructions}` : ""})
                  </span>
                </p>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
