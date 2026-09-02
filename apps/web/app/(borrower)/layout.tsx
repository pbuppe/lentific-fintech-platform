import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/session";

export default async function BorrowerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "INVESTOR") redirect("/investor/dashboard");
  if (user.role !== "BORROWER") redirect((process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001") + "/");

  const NAV = [
    { href: "/dashboard", label: "Mes demandes" },
    { href: "/onboarding", label: "Mon profil" },
    { href: "/demande", label: "Déposer une demande" },
    { href: "/investisseurs", label: "Investisseurs disponibles" },
    { href: "/mises-en-relation", label: "Mises en relation" },
    { href: "/documents", label: "Mes documents" },
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
