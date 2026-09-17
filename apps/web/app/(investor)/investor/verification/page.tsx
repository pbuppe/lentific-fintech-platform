import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@fintech/database";
import { uploadDocument } from "@fintech/documents";
import { submitForVerification, listOwnDocuments } from "@fintech/investors";
import { Card, StatusPill } from "@fintech/ui";
import { getCurrentUser } from "../../../../lib/session";

async function submitVerificationAction(formData: FormData) {
  "use server";
  const t = await getTranslations("InvestorVerification");
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const incomeFile = formData.get("proofOfIncome") as File;
  const fundsFile = formData.get("proofOfFunds") as File;
  if (!incomeFile?.size || !fundsFile?.size) {
    redirect(`/investor/verification?error=${encodeURIComponent(t("requiredDocsError"))}`);
  }

  const incomeDoc = await uploadDocument({
    ownerId: user.id,
    type: "proof_of_income",
    fileName: incomeFile.name,
    content: Buffer.from(await incomeFile.arrayBuffer()),
  });
  const fundsDoc = await uploadDocument({
    ownerId: user.id,
    type: "proof_of_funds",
    fileName: fundsFile.name,
    content: Buffer.from(await fundsFile.arrayBuffer()),
  });

  await submitForVerification(user.id, [incomeDoc.id, fundsDoc.id]);
  revalidatePath("/investor/verification");
}

export default async function InvestorVerificationPage({ searchParams }: { searchParams: { error?: string } }) {
  const t = await getTranslations("InvestorVerification");
  const STATUS_LABEL: Record<string, string> = t.raw("statusLabels");

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [profile, documents] = await Promise.all([
    prisma.investorProfile.findUnique({ where: { userId: user.id } }),
    listOwnDocuments(user.id),
  ]);
  const status = profile?.verificationStatus ?? "UNVERIFIED";
  const incomeDoc = documents.find((d) => d.type === "proof_of_income");
  const fundsDoc = documents.find((d) => d.type === "proof_of_funds");
  const canSubmit = status === "UNVERIFIED" || status === "REJECTED";

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">apps/web · (investor)</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{t("title")}</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {t("subtitle")}
      </p>

      <div className="mt-4">
        <StatusPill tone={status === "VERIFIED" ? "ok" : status === "REJECTED" ? "risk" : "pending"}>
          {STATUS_LABEL[status] ?? status}
        </StatusPill>
      </div>

      {status === "REJECTED" && profile?.rejectionReason && (
        <p className="mt-2 text-sm text-accent">{t("rejectionReason", { reason: profile.rejectionReason })}</p>
      )}

      {searchParams.error && (
        <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">{searchParams.error}</p>
      )}

      {status === "VERIFIED" && (
        <Card className="mt-6">
          <p className="text-sm text-success">
            {t("verifiedMessage")}
          </p>
        </Card>
      )}

      {status === "PENDING_REVIEW" && (
        <Card className="mt-6">
          <p className="text-sm text-ink-soft">
            {t("pendingMessage")}
          </p>
          <div className="mt-3 grid gap-1 text-xs text-ink-faint">
            {incomeDoc && <span>{t("incomeDocLabel", { name: incomeDoc.storageKey.split("-").slice(1).join("-") })}</span>}
            {fundsDoc && <span>{t("fundsDocLabel", { name: fundsDoc.storageKey.split("-").slice(1).join("-") })}</span>}
          </div>
        </Card>
      )}

      {canSubmit && (
        <Card className="mt-6">
          <form action={submitVerificationAction} className="grid gap-4">
            <label className="grid gap-1 text-sm text-ink-soft">
              {t("incomeFieldLabel")} <span className="text-xs text-ink-faint">{t("incomeFieldHint")}</span>
              <input type="file" name="proofOfIncome" required className="text-xs" />
            </label>
            <label className="grid gap-1 text-sm text-ink-soft">
              {t("fundsFieldLabel")} <span className="text-xs text-ink-faint">{t("fundsFieldHint")}</span>
              <input type="file" name="proofOfFunds" required className="text-xs" />
            </label>
            <button className="mt-2 rounded-lg bg-yellow px-4 py-2.5 text-sm font-semibold text-ink hover:bg-yellow-ink">
              {t("submitButton")}
            </button>
          </form>
        </Card>
      )}
    </main>
  );
}
