import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations, getLocale } from "next-intl/server";
import { usersRepo } from "@fintech/database";
import {
  approveAccount,
  rejectAccount,
  resendEmailVerification,
  ACCOUNT_REVIEWER_ROLES,
  AuthError,
} from "@fintech/auth";
import { Card, StatusPill } from "@fintech/ui";
import { getCurrentUser } from "../../../lib/session";

/**
 * File de validation des inscriptions (demande produit 2026-11-14) : aucun
 * emprunteur/investisseur n'accède à son espace avant qu'un administrateur
 * (ADMIN ou SUPER_ADMIN, pas un simple agent) ne valide son compte ici.
 */

async function requireReviewer() {
  const user = await getCurrentUser();
  if (!user || !ACCOUNT_REVIEWER_ROLES.includes(user.role)) redirect("/");
  return user;
}

async function approveAction(formData: FormData) {
  "use server";
  const reviewer = await requireReviewer();
  const userId = formData.get("userId") as string;
  try {
    await approveAccount(userId, reviewer);
  } catch (error) {
    if (error instanceof AuthError) redirect(`/validations?error=${encodeURIComponent(error.message)}`);
    throw error;
  }
  revalidatePath("/validations");
  redirect("/validations?done=approved");
}

async function rejectAction(formData: FormData) {
  "use server";
  const reviewer = await requireReviewer();
  const userId = formData.get("userId") as string;
  const reason = (formData.get("reason") as string) ?? "";
  try {
    await rejectAccount(userId, reviewer, reason);
  } catch (error) {
    if (error instanceof AuthError) redirect(`/validations?error=${encodeURIComponent(error.message)}`);
    throw error;
  }
  revalidatePath("/validations");
  redirect("/validations?done=rejected");
}

async function resendAction(formData: FormData) {
  "use server";
  await requireReviewer();
  await resendEmailVerification(formData.get("userId") as string);
  redirect("/validations?done=resent");
}

export default async function AccountValidationPage({
  searchParams,
}: {
  searchParams: { error?: string; done?: string };
}) {
  await requireReviewer();
  const t = await getTranslations("AccountValidationPage");
  const locale = await getLocale();
  const fmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });

  const [toReview, emailPending, recentlyRejected] = await Promise.all([
    usersRepo.listByAccountStatus("PENDING_REVIEW"),
    usersRepo.listByAccountStatus("PENDING_EMAIL"),
    usersRepo.listByAccountStatus("REJECTED"),
  ]);

  const roleLabel = (role: string) => (role === "INVESTOR" ? t("roleInvestor") : t("roleBorrower"));

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("kicker")}</p>
      <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-lg text-sm text-ink-soft">{t("description")}</p>

      {searchParams.error && (
        <p role="alert" className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">
          {searchParams.error}
        </p>
      )}
      {searchParams.done && (
        <p role="status" className="mt-4 rounded-lg bg-success-soft px-3 py-2 text-sm text-success">
          {searchParams.done === "approved" && t("doneApproved")}
          {searchParams.done === "rejected" && t("doneRejected")}
          {searchParams.done === "resent" && t("doneResent")}
        </p>
      )}

      {/* --- À valider -------------------------------------------------- */}
      <h2 className="mt-8 font-display text-lg font-semibold text-ink">
        {t("toReviewTitle")} <span className="text-ink-faint">({toReview.length})</span>
      </h2>
      <div className="mt-3 grid gap-3">
        {toReview.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-soft">{t("toReviewEmpty")}</p>
          </Card>
        ) : (
          toReview.map((account) => (
            <Card key={account.id} accented>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-display text-base text-ink">{account.name ?? account.email}</p>
                  <p className="text-xs text-ink-faint">{account.email}</p>
                </div>
                <StatusPill tone="pending">{roleLabel(account.role)}</StatusPill>
              </div>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <dt className="text-ink-faint">{t("signedUpAt")}</dt>
                <dd className="text-ink">{fmt.format(account.createdAt)}</dd>
                <dt className="text-ink-faint">{t("emailVerifiedAt")}</dt>
                <dd className="text-ink">{account.emailVerifiedAt ? fmt.format(account.emailVerifiedAt) : "—"}</dd>
                <dt className="text-ink-faint">{t("country")}</dt>
                <dd className="text-ink">{account.country.code}</dd>
              </dl>

              <div className="mt-4 flex flex-wrap items-start gap-3">
                <form action={approveAction}>
                  <input type="hidden" name="userId" value={account.id} />
                  <button className="rounded-lg bg-yellow px-4 py-2 text-sm font-semibold text-ink hover:bg-yellow-ink">
                    {t("approve")}
                  </button>
                </form>
                <details className="min-w-[260px] flex-1">
                  <summary className="inline-block cursor-pointer rounded-lg border border-line px-4 py-2 text-sm font-semibold text-accent">
                    {t("reject")}
                  </summary>
                  <form action={rejectAction} className="mt-3 grid gap-2">
                    <input type="hidden" name="userId" value={account.id} />
                    <label className="grid gap-1 text-sm text-ink-soft">
                      {t("reasonLabel")}
                      <textarea
                        name="reason"
                        required
                        minLength={3}
                        rows={2}
                        className="rounded-lg border border-line px-3 py-2 text-ink"
                        placeholder={t("reasonPlaceholder")}
                      />
                    </label>
                    <button className="justify-self-start rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
                      {t("confirmReject")}
                    </button>
                  </form>
                </details>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* --- E-mail pas encore confirmé ---------------------------------- */}
      <h2 className="mt-10 font-display text-lg font-semibold text-ink">
        {t("emailPendingTitle")} <span className="text-ink-faint">({emailPending.length})</span>
      </h2>
      <p className="mt-1 max-w-lg text-sm text-ink-soft">{t("emailPendingDescription")}</p>
      <div className="mt-3 grid gap-2">
        {emailPending.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-soft">{t("emailPendingEmpty")}</p>
          </Card>
        ) : (
          emailPending.map((account) => (
            <Card key={account.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-ink">
                  {account.name ?? account.email} · <span className="text-ink-faint">{roleLabel(account.role)}</span>
                </p>
                <p className="text-xs text-ink-faint">
                  {account.email} · {t("signedUpAt")} {fmt.format(account.createdAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <form action={resendAction}>
                  <input type="hidden" name="userId" value={account.id} />
                  <button className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:border-brand">
                    {t("resend")}
                  </button>
                </form>
                <form action={approveAction}>
                  <input type="hidden" name="userId" value={account.id} />
                  <button className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:border-brand">
                    {t("approveAnyway")}
                  </button>
                </form>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* --- Refusés --------------------------------------------------- */}
      {recentlyRejected.length > 0 && (
        <>
          <h2 className="mt-10 font-display text-lg font-semibold text-ink">
            {t("rejectedTitle")} <span className="text-ink-faint">({recentlyRejected.length})</span>
          </h2>
          <div className="mt-3 grid gap-2">
            {recentlyRejected.map((account) => (
              <Card key={account.id}>
                <p className="text-sm text-ink">
                  {account.name ?? account.email} · <span className="text-ink-faint">{account.email}</span>
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  {account.accountReviewedAt && fmt.format(account.accountReviewedAt)} — {account.accountRejectionReason}
                </p>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
