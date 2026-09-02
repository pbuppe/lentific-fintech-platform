import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/session";

export default async function InvestorLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "BORROWER") redirect("/dashboard");
  if (user.role !== "INVESTOR") redirect((process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001") + "/");

  const NAV = [
    { href: "/investor/dashboard", label: "Marketplace" },
    { href: "/investor/offres", label: "Mes offres de capital" },
    { href: "/investor/portfolio", label: "Mon portefeuille" },
    { href: "/investor/mises-en-relation", label: "Mises en relation" },
    { href: "/investor/verification", label: "Vérification" },
    { href: "/investor/documents", label: "Mes documents" },
    { href: "/investor/premium", label: "Premium" },
    { href: "/investor/notifications", label: "Alertes" },
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
