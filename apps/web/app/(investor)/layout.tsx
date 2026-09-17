import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "../../lib/session";

export default async function InvestorLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "BORROWER") redirect("/dashboard");
  if (user.role !== "INVESTOR") redirect((process.env.ADMIN_URL ?? "http://localhost:3001") + "/");

  const t = await getTranslations("InvestorLayout");

  const NAV = [
    { href: "/investor/dashboard", label: t("nav.marketplace") },
    { href: "/investor/offres", label: t("nav.capitalOffers") },
    { href: "/investor/portfolio", label: t("nav.portfolio") },
    { href: "/investor/mises-en-relation", label: t("nav.introductions") },
    { href: "/investor/verification", label: t("nav.verification") },
    { href: "/investor/documents", label: t("nav.documents") },
    { href: "/investor/premium", label: t("nav.premium") },
    { href: "/investor/notifications", label: t("nav.notifications") },
  ];

  return (
    <div>
      <nav className="flex gap-1 border-b border-line bg-surface-alt px-6 py-2 sm:px-12">
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-surface hover:text-ink"
          >
            {item.label}
          </a>
        ))}
      </nav>
      {children}
    </div>
  );
}
