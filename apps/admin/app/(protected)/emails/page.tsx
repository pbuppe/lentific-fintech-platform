import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { outboundEmailsRepo } from "@fintech/database";
import { ACCOUNT_REVIEWER_ROLES } from "@fintech/auth";
import { Card, StatusPill } from "@fintech/ui";
import { getCurrentUser } from "../../../lib/session";

/**
 * Journal des e-mails émis par la plateforme (demande produit 2026-11-14).
 * Tant qu'aucun fournisseur d'envoi n'est configuré (RESEND_API_KEY), les
 * e-mails restent ici avec le statut « local » : c'est là qu'on récupère le
 * lien de confirmation pour tester le parcours d'inscription.
 */
export default async function OutboundEmailsPage() {
  const user = await getCurrentUser();
  if (!user || !ACCOUNT_REVIEWER_ROLES.includes(user.role)) redirect("/");

  const t = await getTranslations("OutboundEmailsPage");
  const locale = await getLocale();
  const fmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const emails = await outboundEmailsRepo.listRecent(50);
  const providerConfigured = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("kicker")}</p>
      <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-lg text-sm text-ink-soft">
        {providerConfigured ? t("descriptionLive") : t("descriptionLocal")}
      </p>

      <div className="mt-6 grid gap-3">
        {emails.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-soft">{t("empty")}</p>
          </Card>
        ) : (
          emails.map((email) => (
            <Card key={email.id}>
              <details>
                <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
                  <span>
                    <span className="block text-sm font-semibold text-ink">{email.subject}</span>
                    <span className="block text-xs text-ink-faint">
                      {t("to")} {email.to} · {fmt.format(email.createdAt)}
                    </span>
                  </span>
                  {email.status === "SENT" && <StatusPill tone="ok">{t("statusSent")}</StatusPill>}
                  {email.status === "LOCAL" && <StatusPill tone="pending">{t("statusLocal")}</StatusPill>}
                  {email.status === "FAILED" && <StatusPill tone="risk">{t("statusFailed")}</StatusPill>}
                </summary>
                {email.error && <p className="mt-3 text-xs text-accent">{email.error}</p>}
                <iframe
                  title={email.subject}
                  // Liens ouverts dans un nouvel onglet plutôt que dans l'aperçu.
                  srcDoc={`<base target="_blank">${email.html}`}
                  sandbox="allow-popups allow-popups-to-escape-sandbox"
                  className="mt-3 h-[460px] w-full rounded-lg border border-line bg-white"
                />
              </details>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
