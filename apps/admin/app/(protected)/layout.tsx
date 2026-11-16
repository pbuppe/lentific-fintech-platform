import { cookies } from "next/headers";
import { LogoMark, Icon, type IconName } from "@fintech/ui";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { signOut, SESSION_COOKIE_NAME } from "@fintech/auth";
import { usersRepo, prisma } from "@fintech/database";
import { countDisbursementsAwaitingConfirmation } from "@fintech/applications";
import { getCurrentUser } from "../../lib/session";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

const NAV_KEYS = [
  { href: "/", key: "cases", icon: "folder" },
  { href: "/kyc", key: "kyc", icon: "idCard" },
  { href: "/investisseurs", key: "investorVerification", icon: "shieldCheck" },
  { href: "/contracts", key: "contracts", icon: "fileSignature" },
  { href: "/mises-en-relation", key: "introductions", icon: "handshake" },
  { href: "/echeances", key: "installments", icon: "calendar" },
  { href: "/risk", key: "riskEngine", icon: "gauge" },
  // Suivi des visiteurs : agents, admins et super admins (demande produit 2026-11-15).
  { href: "/statistiques", key: "statistics", icon: "barChart" },
] as const satisfies ReadonlyArray<{ href: string; key: string; icon: IconName }>;

// Pouvoir complet sur les comptes (§ demande produit) réservé au super
// administrateur, pas aux simples agents/admins.
const SUPER_ADMIN_NAV_KEYS = [
  { href: "/console", key: "console", icon: "crown" },
  { href: "/comptes", key: "accountsSuperAdmin", icon: "key" },
] as const satisfies ReadonlyArray<{ href: string; key: string; icon: IconName }>;

// Statistiques de visite (§ demande produit 2026-09-18) : "dans les comptes
// super admin ... et dans le compte admin", donc admin/super admin, pas agent.
// Validation des inscriptions + journal des e-mails (demande produit
// 2026-11-14) : décision d'administrateur, pas d'agent.
const ADMIN_AND_ABOVE_NAV_KEYS = [
  { href: "/prospects", key: "prospects", icon: "phone" },
  { href: "/messages", key: "clientRequests", icon: "message" },
  { href: "/validations", key: "accountValidation", icon: "userCheck" },
  { href: "/versements", key: "funds", icon: "banknote" },
  { href: "/emails", key: "outboundEmails", icon: "mail" },
  { href: "/marketing", key: "marketing", icon: "megaphone" },
] as const satisfies ReadonlyArray<{ href: string; key: string; icon: IconName }>;

const ADMIN_ROLES = ["AGENT", "ADMIN", "SUPER_ADMIN"];

async function logoutAction() {
  "use server";
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (token) await signOut(token);
  cookies().delete(SESSION_COOKIE_NAME);
  redirect("/login");
}

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || !ADMIN_ROLES.includes(user.role)) {
    redirect("/login");
  }
  const t = await getTranslations("ProtectedLayout");
  const isAdminOrAbove = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const pendingAccounts = isAdminOrAbove ? await usersRepo.countPendingReview() : 0;
  // Nouvelles demandes d étude gratuite du site vitrine, à rappeler.
  const newProspects = isAdminOrAbove ? await prisma.contactRequest.count({ where: { status: "NEW" } }) : 0;
  // Versements déclarés en attente : seul un super admin peut les confirmer.
  const pendingDisbursements = user.role === "SUPER_ADMIN" ? await countDisbursementsAwaitingConfirmation() : 0;

  return (
    <div className="grid min-h-screen grid-cols-[220px_1fr]">
      <nav className="flex flex-col gap-6 bg-brand p-5 text-white">
        <div className="flex items-center gap-2 px-1">
          <LogoMark size={30} plain />
          <div>
            <div className="font-display text-lg font-semibold leading-none">Lentific</div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-white/60">{t("backOffice")}</div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {NAV_KEYS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-white/85 hover:bg-white/10"
            >
              <Icon name={item.icon} size={18} className="text-white/70" />
              {t(item.key)}
            </a>
          ))}
          {isAdminOrAbove &&
            ADMIN_AND_ABOVE_NAV_KEYS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-md px-2.5 py-2 text-sm font-medium text-white/85 hover:bg-white/10"
              >
                <span className="flex items-center gap-2.5">
                  <Icon name={item.icon} size={18} className="text-white/70" />
                  {t(item.key)}
                </span>
                {item.href === "/validations" && pendingAccounts > 0 && (
                  <span
                    className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white"
                    aria-label={t("pendingCount", { count: pendingAccounts })}
                  >
                    {pendingAccounts}
                  </span>
                )}
                {item.href === "/prospects" && newProspects > 0 && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white" aria-label={t("newProspectsCount", { count: newProspects })}>
                    {newProspects}
                  </span>
                )}
                {item.href === "/versements" && pendingDisbursements > 0 && (
                  <span
                    className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white"
                    aria-label={t("pendingFundsCount", { count: pendingDisbursements })}
                  >
                    {pendingDisbursements}
                  </span>
                )}
              </a>
            ))}
          {user.role === "SUPER_ADMIN" &&
            SUPER_ADMIN_NAV_KEYS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 rounded-md border border-white/20 px-2.5 py-2 text-sm font-medium text-white hover:bg-white/10"
              >
                <Icon name={item.icon} size={18} className="text-yellow" />
                {t(item.key)}
              </a>
            ))}
        </div>
        <div className="mt-auto border-t border-white/15 pt-4">
          <p className="flex items-center gap-1.5 truncate px-1 text-xs text-white/70">
            <Icon name="user" size={14} />
            {user.name ?? user.email}
          </p>
          <p className="px-1 font-mono text-[10px] uppercase tracking-widest text-white/45">{user.role}</p>
          <div className="mt-3">
            <LanguageSwitcher />
          </div>
          <form action={logoutAction} className="mt-2">
            <button className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium text-white/85 hover:bg-white/10">
              <Icon name="logout" size={18} className="text-white/70" />
              {t("logout")}
            </button>
          </form>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
