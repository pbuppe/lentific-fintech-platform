import { getTranslations } from "next-intl/server";
import { verifyEmailToken } from "@fintech/auth";
import { Card, StatusPill } from "@fintech/ui";
import { getSignedInUser } from "../../../lib/session";

/**
 * Cible du lien envoyé par e-mail à l'inscription (demande produit
 * 2026-11-14). Fonctionne même sans être connecté (lien ouvert sur un autre
 * appareil) : le jeton suffit à prouver la possession de l'adresse.
 */
export default async function VerifyEmailPage({ searchParams }: { searchParams: { token?: string } }) {
  const result = await verifyEmailToken(searchParams.token);
  const t = await getTranslations("VerifyEmail");
  const user = await getSignedInUser();
  const ok = result === "verified" || result === "already_verified";

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("kicker")}</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
        {ok ? t("titleOk") : t("titleError")}
      </h1>
      <Card className="mt-6" accented={!ok}>
        <div className="mb-3">
          {ok ? <StatusPill tone="ok">{t("pillOk")}</StatusPill> : <StatusPill tone="risk">{t("pillError")}</StatusPill>}
        </div>
        <p className="text-sm text-ink-soft">
          {result === "verified" && t("bodyVerified")}
          {result === "already_verified" && t("bodyAlready")}
          {result === "expired" && t("bodyExpired")}
          {result === "invalid" && t("bodyInvalid")}
        </p>
        <a
          href={user ? "/compte-en-attente" : "/login"}
          className="mt-4 inline-block rounded-lg bg-yellow px-4 py-2.5 text-sm font-semibold text-ink hover:bg-yellow-ink"
        >
          {user ? t("ctaStatus") : t("ctaLogin")}
        </a>
      </Card>
    </main>
  );
}
