import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { resendEmailVerification } from "@fintech/auth";
import { Card, StatusPill } from "@fintech/ui";
import { getSignedInUser } from "../../../lib/session";

/**
 * Page d'état d'un compte pas encore actif (demande produit 2026-11-14) :
 * seul écran accessible tant qu'un administrateur n'a pas validé
 * l'inscription. Les layouts (borrower)/(investor) y renvoient.
 */

async function resendAction() {
  "use server";
  const user = await getSignedInUser();
  if (!user) redirect("/login");
  await resendEmailVerification(user.id);
  redirect("/compte-en-attente?resent=1");
}

const STEP_ORDER = ["PENDING_EMAIL", "PENDING_REVIEW", "ACTIVE"] as const;

export default async function AccountPendingPage({ searchParams }: { searchParams: { resent?: string } }) {
  const user = await getSignedInUser();
  if (!user) redirect("/login");
  if (user.accountStatus === "ACTIVE") {
    redirect(user.role === "INVESTOR" ? "/investor/dashboard" : user.role === "BORROWER" ? "/dashboard" : "/");
  }

  const t = await getTranslations("AccountPending");
  const status = user.accountStatus;
  const closed = status === "REJECTED" || status === "SUSPENDED";
  const currentStep = STEP_ORDER.indexOf(status as (typeof STEP_ORDER)[number]);

  const steps = [
    { key: "PENDING_EMAIL", label: t("stepSignup") },
    { key: "PENDING_REVIEW", label: t("stepEmail") },
    { key: "ACTIVE", label: t("stepReview") },
  ];

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("kicker")}</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
        {status === "PENDING_EMAIL" && t("titleEmail")}
        {status === "PENDING_REVIEW" && t("titleReview")}
        {status === "REJECTED" && t("titleRejected")}
        {status === "SUSPENDED" && t("titleSuspended")}
      </h1>

      {!closed && (
        <ol className="mt-6 grid gap-2">
          {steps.map((step, i) => {
            const done = i < currentStep;
            const current = i === currentStep;
            return (
              <li key={step.key} className="flex items-center gap-3 text-sm">
                <span
                  aria-hidden
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    done ? "bg-success text-white" : current ? "bg-brand text-white" : "bg-surface-alt text-ink-faint"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className={done ? "text-ink-soft" : current ? "font-semibold text-ink" : "text-ink-faint"}>
                  {step.label}
                  {done && <span className="sr-only"> — {t("done")}</span>}
                  {current && <span className="sr-only"> — {t("inProgress")}</span>}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <Card className="mt-6" accented={closed}>
        <div className="mb-3">
          {status === "PENDING_EMAIL" && <StatusPill tone="pending">{t("pillEmail")}</StatusPill>}
          {status === "PENDING_REVIEW" && <StatusPill tone="pending">{t("pillReview")}</StatusPill>}
          {status === "REJECTED" && <StatusPill tone="risk">{t("pillRejected")}</StatusPill>}
          {status === "SUSPENDED" && <StatusPill tone="risk">{t("pillSuspended")}</StatusPill>}
        </div>

        {status === "PENDING_EMAIL" && (
          <>
            <p className="text-sm text-ink-soft">{t("bodyEmail", { email: user.email })}</p>
            {searchParams.resent && (
              <p role="status" className="mt-3 rounded-lg bg-success-soft px-3 py-2 text-sm text-success">
                {t("resent")}
              </p>
            )}
            <form action={resendAction} className="mt-4">
              <button className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-brand">
                {t("resend")}
              </button>
            </form>
          </>
        )}
        {status === "PENDING_REVIEW" && <p className="text-sm text-ink-soft">{t("bodyReview")}</p>}
        {status === "REJECTED" && (
          <>
            <p className="text-sm text-ink-soft">{t("bodyRejected")}</p>
            {user.accountRejectionReason && (
              <p className="mt-3 text-sm text-ink">
                <span className="font-semibold">{t("reason")}</span> {user.accountRejectionReason}
              </p>
            )}
          </>
        )}
        {status === "SUSPENDED" && <p className="text-sm text-ink-soft">{t("bodySuspended")}</p>}
      </Card>
    </main>
  );
}
