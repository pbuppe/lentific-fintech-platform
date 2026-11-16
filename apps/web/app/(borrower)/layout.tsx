import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { notificationsRepo, prisma } from "@fintech/database";
import { getSignedInUser } from "../../lib/session";
import { AccountShell } from "../components/AccountShell";
import { AssistanceBanner } from "../components/AssistanceViews";
import { NOINDEX } from "../../lib/seo";

// Espace client privé : jamais indexé (SEO, 2026-11-16).
export const metadata = NOINDEX;

export default async function BorrowerLayout({ children }: { children: React.ReactNode }) {
  const user = await getSignedInUser();
  if (!user) redirect("/login");
  // Compte pas encore validé par un administrateur (ou refusé/suspendu) :
  // aucun accès à l'espace, seulement la page d'état du compte.
  if (user.accountStatus !== "ACTIVE") redirect("/compte-en-attente");
  if (user.role === "INVESTOR") redirect("/investor/dashboard");
  if (user.role !== "BORROWER") redirect((process.env.ADMIN_URL ?? "http://localhost:3001") + "/");

  const t = await getTranslations("BorrowerLayout");
  const [unread, unreadMessages, pendingDocs, pendingFees, lastContact] = await Promise.all([
    notificationsRepo.countUnread(user.id),
    notificationsRepo.countUnread(user.id, "message"),
    prisma.documentRequest.count({ where: { targetUserId: user.id, status: "PENDING" } }),
    prisma.brokerFeeRequest.count({ where: { userId: user.id, status: "PENDING" } }),
    // Conseiller = dernier membre de l équipe à avoir écrit au client.
    prisma.notification.findFirst({
      where: { userId: user.id, senderId: { not: null } },
      orderBy: { createdAt: "desc" },
      select: { sender: { select: { name: true, email: true } } },
    }),
  ]);
  const advisor = lastContact?.sender?.name ?? lastContact?.sender?.email ?? null;

  // Demande produit 2026-11-14 : en haut, uniquement ce qui sert à trouver un
  // financement ; tout ce qui concerne le compte du client va dans le menu
  // latéral gauche.
  const top = [
    { href: "/investisseurs", label: t("nav.availableInvestors") },
    { href: "/mises-en-relation", label: t("nav.introductions") },
  ];
  const side = [
    { href: "/dashboard", label: t("nav.myApplications") },
    { href: "/demande", label: t("nav.submitApplication") },
    { href: "/documents", label: t("nav.myDocuments"), badge: pendingDocs },
    { href: "/messages", label: t("nav.messages"), badge: unreadMessages },
    { href: "/paiements", label: t("nav.payments"), badge: pendingFees },
    { href: "/notifications", label: t("nav.notifications"), badge: unread },
    { href: "/premium", label: `★ ${(await getTranslations("PremiumPromo"))("navLabel")}` },
    { href: "/aide", label: t("nav.help") },
    { href: "/onboarding", label: t("nav.myProfile") },
  ];

  return (
    <AccountShell
      top={top}
      side={side}
      sideTitle={t("sideTitle")}
      banner={<AssistanceBanner userId={user.id} helpHref="/aide" />}
      sideFooter={
        <div className="rounded-xl bg-brand p-4 text-sm text-white/80">
          <p>{advisor ? t("advisorTitle") : t("teamTitle")}</p>
          <p className="font-semibold text-white">{advisor ?? t("teamName")}</p>
          <a href="/messages" className="mt-2 inline-block font-semibold text-white underline">
            {t("advisorCta")}
          </a>
        </div>
      }
    >
      {children}
    </AccountShell>
  );
}
