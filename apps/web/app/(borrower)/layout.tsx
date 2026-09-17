import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "../../lib/session";

export default async function BorrowerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "INVESTOR") redirect("/investor/dashboard");
  if (user.role !== "BORROWER") redirect((process.env.ADMIN_URL ?? "http://localhost:3001") + "/");

  const t = await getTranslations("BorrowerLayout");
  const NAV = [
    { href: "/dashboard", label: t("nav.myApplications") },
    { href: "/onboarding", label: t("nav.myProfile") },
    { href: "/demande", label: t("nav.submitApplication") },
    { href: "/investisseurs", label: t("nav.availableInvestors") },
    { href: "/mises-en-relation", label: t("nav.introductions") },
    { href: "/documents", label: t("nav.myDocuments") },
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
