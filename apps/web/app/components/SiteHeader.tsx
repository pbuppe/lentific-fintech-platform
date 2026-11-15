import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { signOut, SESSION_COOKIE_NAME } from "@fintech/auth";
import { notificationsRepo } from "@fintech/database";
import { getSignedInUser } from "../../lib/session";
import { LanguageSwitcher } from "./LanguageSwitcher";

async function logoutAction() {
  "use server";
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (token) await signOut(token);
  cookies().delete(SESSION_COOKIE_NAME);
  redirect("/");
}

export async function SiteHeader() {
  const user = await getSignedInUser();
  const t = await getTranslations("SiteHeader");
  const active = user?.accountStatus === "ACTIVE" && (user.role === "BORROWER" || user.role === "INVESTOR");
  const unread = active ? await notificationsRepo.countUnread(user!.id) : 0;

  return (
    <header className="flex flex-wrap items-center justify-between gap-y-2 border-b border-line bg-surface px-6 py-3 sm:px-12">
      <div className="flex items-center gap-8">
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand font-display text-base font-semibold text-white">
            S
          </div>
          <span className="font-sans text-sm font-bold uppercase tracking-wide text-ink">SODIVA CREDITS</span>
        </a>
        <nav className="hidden items-center gap-5 text-sm text-ink-soft sm:flex">
          <a href="/#services" className="hover:text-ink">{t("services")}</a>
          <a href="/#comment-ca-marche" className="hover:text-ink">{t("howItWorks")}</a>
          <a href="/marketplace" className="hover:text-ink">{t("marketplace")}</a>
          <a href="/simulateur" className="hover:text-ink">{t("simulator")}</a>
          <a href="/#contact" className="hover:text-ink">{t("contact")}</a>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3 text-sm">
            {active && (
              <a
                href={user.role === "INVESTOR" ? "/investor/notifications" : "/notifications"}
                className="relative rounded-lg border border-line px-2.5 py-1 text-base leading-none hover:bg-surface-alt"
                aria-label={t("notifications", { count: unread })}
                title={t("notifications", { count: unread })}
              >
                <span aria-hidden>🔔</span>
                {unread > 0 && (
                  <span className="absolute -right-2 -top-2 min-w-[18px] rounded-full bg-accent px-1 text-center text-[10px] font-bold leading-[18px] text-white">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </a>
            )}
            <a
              href={user.accountStatus !== "ACTIVE" ? "/compte-en-attente" : user.role === "INVESTOR" ? "/investor/dashboard" : "/dashboard"}
              className="hidden text-ink-soft hover:text-ink sm:inline"
            >
              {user.name ?? user.email}
            </a>
            <form action={logoutAction}>
              <button className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-surface-alt">
                {t("logout")}
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <a href="/login" className="px-2 py-1.5 text-ink-soft hover:text-ink">
              {t("login")}
            </a>
            <a href="/signup" className="rounded-lg bg-yellow px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-yellow-ink">
              {t("signup")}
            </a>
          </div>
        )}
        <LanguageSwitcher />
      </div>
    </header>
  );
}
