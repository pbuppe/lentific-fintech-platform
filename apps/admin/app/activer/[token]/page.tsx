import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { findValidSetupToken, activateStaffAccount, ConsoleError } from "@fintech/auth";
import { Card } from "@fintech/ui";

/**
 * Activation d'un compte d'équipe invité depuis la console super admin
 * (2026-11-14). Accessible sans session : protégée par le jeton à usage
 * unique (empreinte en base, 72 h). La personne choisit son mot de passe,
 * puis se connecte normalement.
 */
export const metadata: Metadata = { robots: { index: false, follow: false, nocache: true } };

async function activateAction(formData: FormData) {
  "use server";
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password !== confirm) redirect(`/activer/${token}?error=mismatch`);
  try {
    await activateStaffAccount(token, password);
  } catch (error) {
    if (error instanceof ConsoleError) redirect(`/activer/${token}?error=${error.message}`);
    throw error;
  }
  redirect("/login?activated=1");
}

export default async function ActivatePage({ params, searchParams }: { params: { token: string }; searchParams: { error?: string } }) {
  const t = await getTranslations("ActivatePage");
  const row = await findValidSetupToken(params.token);
  const errors = ["mismatch", "password_short", "invalid_link"];

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("kicker")}</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-brand">{row ? t("title", { name: row.user.name ?? "" }) : t("invalidTitle")}</h1>
      <Card className="mt-6">
        {!row ? (
          <p className="text-sm text-ink-soft">{t("invalidBody")}</p>
        ) : (
          <form action={activateAction} className="grid gap-4">
            <input type="hidden" name="token" value={params.token} />
            <p className="text-sm text-ink-soft">{t("intro", { email: row.user.email })}</p>
            {searchParams.error && errors.includes(searchParams.error) && (
              <p role="alert" className="rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">{t(`errors.${searchParams.error}`)}</p>
            )}
            <label className="grid gap-1 text-xs font-semibold text-ink-soft">
              {t("password")}
              <input type="password" name="password" required minLength={10} autoComplete="new-password" className="rounded-lg border border-line px-3 py-2 text-sm text-ink" />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-ink-soft">
              {t("confirm")}
              <input type="password" name="confirm" required minLength={10} autoComplete="new-password" className="rounded-lg border border-line px-3 py-2 text-sm text-ink" />
            </label>
            <p className="text-xs text-ink-faint">{t("rule")}</p>
            <button className="rounded-lg bg-yellow px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-ink">{t("submit")}</button>
          </form>
        )}
      </Card>
    </main>
  );
}
