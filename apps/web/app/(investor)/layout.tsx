import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { notificationsRepo, prisma } from "@fintech/database";
import { getSignedInUser } from "../../lib/session";
import { AccountShell } from "../components/AccountShell";
import { AssistanceBanner } from "../components/AssistanceViews";

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
    { href: "/investor/dashboard", label: t("nav.marketplace") },
    { href: "/investor/mises-en-relation", label: t("nav.introductions") },
  ];
  const side = [
    { href: "/investor/portfolio", label: t("nav.portfolio") },
    { href: "/investor/offres", label: t("nav.capitalOffers") },
    { href: "/investor/documents", label: t("nav.documents"), badge: pendingDocs },
    { href: "/investor/messages", label: t("nav.messages"), badge: unreadMessages },
    { href: "/investor/notifications", label: t("nav.notifications"), badge: unread },
    { href: "/investor/aide", label: t("nav.help") },
    { href: "/investor/verification", label: t("nav.verification") },
    { href: "/investor/premium", label: t("nav.premium") },
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
