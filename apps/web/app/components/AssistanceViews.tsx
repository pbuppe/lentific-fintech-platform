import { cookies } from "next/headers";
import { getTranslations, getLocale } from "next-intl/server";
import { getClientAssistance, listConsoleLogForClient } from "@fintech/auth";
import { Card } from "@fintech/ui";
import { requestAssistanceCodeAction, cancelAssistanceCodeAction } from "../../lib/actions/assistance";
import { ASSIST_CODE_COOKIE } from "../../lib/assistCookie";
import { AutoRefresh } from "./AutoRefresh";

/**
 * Bandeau affiché en haut de l'espace client pendant une assistance en
 * direct (maquette Lentific) : qui aide, jusqu'à quand, et le guidage en cours.
 */
export async function AssistanceBanner({ userId, helpHref }: { userId: string; helpHref: string }) {
  const assistance = await getClientAssistance(userId);
  if (!assistance) return null;
  const t = await getTranslations("ClientHelp");
  const locale = await getLocale();
  const time = new Intl.DateTimeFormat(locale, { timeStyle: "short" });

  if (assistance.state === "pending") {
    return (
      <div className="border-b border-line bg-sand px-6 py-2 text-sm text-sand-ink sm:px-12">
        <AutoRefresh seconds={8} />
        {t("bannerPending")}{" "}
        <a href={helpHref} className="font-semibold underline">{t("bannerSeeCode")}</a>
      </div>
    );
  }
  return (
    <div className="border-b border-brand bg-brand px-6 py-2.5 text-sm text-white sm:px-12">
      <AutoRefresh seconds={8} />
      <p>
        <span className="font-semibold">
          {t("bannerActive", { name: assistance.staff?.name ?? assistance.staff?.email ?? "", time: time.format(assistance.expiresAt!) })}
        </span>
      </p>
      {assistance.guidance && (
        <p className="mt-1 rounded-md bg-white/15 px-3 py-1.5">
          <span className="font-semibold">{t("guideLabel")}</span> {t(`guidance.${assistance.guidance}` as "guidance.sign")}
        </p>
      )}
    </div>
  );
}

/** Page « Besoin d'aide ? » : obtenir un code, voir la session en cours et le journal. */
export async function HelpView({ userId }: { userId: string }) {
  const t = await getTranslations("ClientHelp");
  const locale = await getLocale();
  const dt = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const time = new Intl.DateTimeFormat(locale, { timeStyle: "short" });
  const [assistance, log] = await Promise.all([getClientAssistance(userId), listConsoleLogForClient(userId)]);
  const code = assistance?.state === "pending" ? cookies().get(ASSIST_CODE_COOKIE)?.value : undefined;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-brand">{t("title")}</h1>
      <p className="mt-2 max-w-xl text-sm text-ink-soft">{t("subtitle")}</p>

      <Card className="mt-6" accented>
        {assistance?.state === "active" ? (
          <>
            <AutoRefresh seconds={8} />
            <p className="font-display text-base font-semibold text-ink">
              {t("activeTitle", { name: assistance.staff?.name ?? assistance.staff?.email ?? "" })}
            </p>
            <p className="mt-1 text-sm text-ink-soft">{t("activeBody", { time: time.format(assistance.expiresAt!) })}</p>
            {assistance.guidance && (
              <p className="mt-3 rounded-lg border-2 border-sand-ink/30 bg-sand px-4 py-3 text-sm text-ink">
                <span className="font-semibold">{t("guideLabel")}</span> {t(`guidance.${assistance.guidance}` as "guidance.sign")}
              </p>
            )}
          </>
        ) : assistance?.state === "pending" && code ? (
          <>
            <AutoRefresh seconds={5} />
            <p className="text-sm text-ink-soft">{t("giveCode")}</p>
            <p className="mt-2 font-display text-4xl font-semibold tracking-[0.3em] text-ink" aria-label={code.split("").join(" ")}>
              {code.slice(0, 3)} {code.slice(3)}
            </p>
            <p className="mt-1 text-xs text-ink-faint">{t("codeValidity", { time: time.format(assistance.codeExpiresAt) })}</p>
            <p className="mt-3 text-xs text-ink-soft">{t("codeConsent")}</p>
            <form action={cancelAssistanceCodeAction} className="mt-3">
              <button className="text-xs font-semibold text-accent underline">{t("cancel")}</button>
            </form>
          </>
        ) : (
          <form action={requestAssistanceCodeAction} className="grid gap-3">
            <p className="font-display text-base font-semibold text-ink">{t("askTitle")}</p>
            <label className="grid gap-1 text-xs font-semibold text-ink-soft">
              {t("problemLabel")}
              <textarea name="problem" rows={2} maxLength={300} placeholder={t("problemPlaceholder")} className="rounded-lg border border-line px-3 py-2 text-sm text-ink" />
            </label>
            <p className="text-xs text-ink-faint">{t("askNote")}</p>
            <button className="justify-self-start rounded-lg bg-yellow px-4 py-2 text-sm font-semibold text-ink hover:bg-yellow-ink">{t("getCode")}</button>
          </form>
        )}
      </Card>

      <h2 className="mt-8 font-display text-lg text-ink">{t("logTitle")}</h2>
      {log.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">{t("logEmpty")}</p>
      ) : (
        <Card className="mt-3">
          <ul className="grid gap-1.5">
            {log.map((l) => {
              const key = l.action.replace("console.", "");
              return (
                <li key={l.id} className="text-sm text-ink-soft">
                  <span className="font-semibold text-ink">{t.has(`logActions.${key}`) ? t(`logActions.${key}` as "logTitle") : key}</span>
                  {" · "}
                  {l.user?.name ?? l.user?.email ?? "—"}
                  {" · "}
                  <span className="text-xs text-ink-faint">{dt.format(l.createdAt)}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
      <p className="mt-4 text-xs text-ink-faint">{t("safety")}</p>
    </main>
  );
}
