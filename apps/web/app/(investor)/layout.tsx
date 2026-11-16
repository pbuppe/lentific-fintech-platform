import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { notificationsRepo, prisma } from "@fintech/database";
import { getSignedInUser } from "../../lib/session";
import { AccountShell } from "../components/AccountShell";
import { AssistanceBanner } from "../components/AssistanceViews";
import { NOINDEX } from "../../lib/seo";

// Espace investisseur privé : jamais indexé (SEO, 2026-11-16).
export const metadata = NOINDEX;

export default async function InvestorLayout({ children }: { children: React.ReactNode }) {
  const user = await getSignedInUser();
  if (!user) redirect("/login");
  // Compte pas encore validé par un administrateur (ou refusé/suspendu) :
  // aucun accès à l'espace, seulement la page d'état du compte.
  if (user.accountStatus !== "ACTIVE") redirect("/compte-en-attente");
  if (user.role === "BORROWER") redirect("/dashboard");
  if (user.role !== "INVESTOR") redirect((process.env.ADMIN_URL ?? "http://localhost:3001") + "/");

  const t = await getTranslations("InvestorLayout");
  const [unread, unreadMessages, pendingDocs] = await Promise.all([
    notificationsRepo.countUnread(user.id),
    notificationsRepo.countUnread(user.id, "message"),
    prisma.documentRequest.count({ where: { targetUserId: user.id, status: "PENDING" } }),
  ]);

  // Même organisation que l'espace emprunteur : découverte en haut, compte à gauche.
  const top = [
    { href: "/investor/dashboard", label: t("nav.marketplace"), icon: "store" as const },
    { href: "/investor/mises-en-relation", label: t("nav.introductions"), icon: "handshake" as const },
  ];
  const side = [
    { href: "/investor/portfolio", label: t("nav.portfolio"), icon: "pieChart" as const },
    { href: "/investor/offres", label: t("nav.capitalOffers"), icon: "coins" as const },
    { href: "/investor/documents", label: t("nav.documents"), icon: "file" as const, badge: pendingDocs },
    { href: "/investor/messages", label: t("nav.messages"), icon: "message" as const, badge: unreadMessages },
    { href: "/investor/notifications", label: t("nav.notifications"), icon: "bell" as const, badge: unread },
    { href: "/investor/aide", label: t("nav.help"), icon: "help" as const },
    { href: "/investor/verification", label: t("nav.verification"), icon: "shieldCheck" as const },
    { href: "/investor/premium", label: t("nav.premium"), icon: "star" as const },
  ];

  return (
    <AccountShell
      top={top}
      side={side}
      sideTitle={t("sideTitle")}
      banner={<AssistanceBanner userId={user.id} helpHref="/investor/aide" />}
    >
      {children}
    </AccountShell>
  );
}
