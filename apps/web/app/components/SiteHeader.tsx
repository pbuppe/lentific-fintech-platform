import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signOut, SESSION_COOKIE_NAME } from "@fintech/auth";
import { getCurrentUser } from "../../lib/session";

async function logoutAction() {
  "use server";
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (token) await signOut(token);
  cookies().delete(SESSION_COOKIE_NAME);
  redirect("/");
}

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="flex items-center justify-between border-b border-line bg-surface px-6 py-3 sm:px-12">
      <div className="flex items-center gap-8">
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent font-display text-sm font-bold text-white">
            L
          </div>
          <span className="font-sans text-sm font-bold uppercase tracking-wide text-ink">Lentific</span>
        </a>
        <nav className="hidden items-center gap-5 text-sm text-ink-soft sm:flex">
          <a href="/#comment-ca-marche" className="hover:text-ink">Comment ça marche</a>
          <a href="/marketplace" className="hover:text-ink">Marketplace</a>
          <a href="/simulateur" className="hover:text-ink">Simulateur</a>
        </nav>
      </div>

      {user ? (
        <div className="flex items-center gap-3 text-sm">
          <a
            href={user.role === "INVESTOR" ? "/investor/dashboard" : "/dashboard"}
            className="text-ink-soft hover:text-ink"
          >
            {user.name ?? user.email}
          </a>
          <form action={logoutAction}>
            <button className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-surface-alt">
              Déconnexion
            </button>
          </form>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm">
          <a href="/login" className="px-2 py-1.5 text-ink-soft hover:text-ink">
            Se connecter
          </a>
          <a href="/signup" className="rounded-lg bg-yellow px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-yellow-ink">
            Créer un compte
          </a>
        </div>
      )}
    </header>
  );
}
