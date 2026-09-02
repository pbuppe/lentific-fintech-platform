import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signOut, SESSION_COOKIE_NAME } from "@fintech/auth";
import { getCurrentUser } from "../../lib/session";

const NAV = [
  { href: "/", label: "Dossiers" },
  { href: "/kyc", label: "Vérification d'identité" },
  { href: "/investisseurs", label: "Vérification investisseurs" },
  { href: "/contracts", label: "Contrats à vérifier" },
  { href: "/mises-en-relation", label: "Mises en relation" },
  { href: "/echeances", label: "Échéances à encaisser" },
  { href: "/risk", label: "Moteur de risque" },
];

// Pouvoir complet sur les comptes (§ demande produit) réservé au super
// administrateur, pas aux simples agents/admins.
const SUPER_ADMIN_NAV = [{ href: "/comptes", label: "Comptes (super admin)" }];

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

  return (
    <div className="grid min-h-screen grid-cols-[220px_1fr]">
      <nav className="flex flex-col gap-6 bg-brand p-5 text-white">
        <div className="flex items-center gap-2 px-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent font-display text-sm font-bold">
            L
          </div>
          <div>
            <div className="font-sans text-sm font-bold uppercase tracking-wide">Lentific</div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-white/60">Back-office</div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-2.5 py-2 text-sm font-medium text-white/85 hover:bg-white/10"
            >
              {item.label}
            </a>
          ))}
          {user.role === "SUPER_ADMIN" &&
            SUPER_ADMIN_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-md border border-white/20 px-2.5 py-2 text-sm font-medium text-white hover:bg-white/10"
              >
                {item.label}
              </a>
            ))}
        </div>
        <div className="mt-auto border-t border-white/15 pt-4">
          <p className="truncate px-1 text-xs text-white/70">{user.name ?? user.email}</p>
          <p className="px-1 font-mono text-[10px] uppercase tracking-widest text-white/45">{user.role}</p>
          <form action={logoutAction} className="mt-2">
            <button className="w-full rounded-md px-2.5 py-2 text-left text-sm font-medium text-white/85 hover:bg-white/10">
              Déconnexion
            </button>
          </form>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
