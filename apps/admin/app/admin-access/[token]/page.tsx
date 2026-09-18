import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { bootstrapAdminAccount, isValidBootstrapToken, AuthError } from "@fintech/auth";
import { countriesRepo } from "@fintech/database";
import { Card } from "@fintech/ui";

/**
 * Lien secret de création de compte admin (§ demande produit 2026-09-18) :
 * "un lien personnel, un lien secret de l'administration [...] qui ne pourra
 * pas être deviné [...] sans forcément se connecter au compte administrateur
 * principal". Volontairement en dehors de (protected) : accessible sans
 * session, protégé uniquement par le jeton dans l'URL (ADMIN_BOOTSTRAP_TOKEN,
 * jamais commité, comparé à temps constant, voir packages/auth). Un jeton
 * incorrect rend un 404 plutôt qu'un message "mauvais mot de passe" : rien ne
 * doit laisser deviner que cette route existe.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

const ROLE_OPTIONS = [
  { value: "AGENT", label: "Agent" },
  { value: "ADMIN", label: "Administrateur" },
  { value: "SUPER_ADMIN", label: "Super administrateur (plein pouvoir)" },
] as const;

async function createAccountAction(formData: FormData) {
  "use server";

  const token = formData.get("token") as string;
  if (!isValidBootstrapToken(token)) notFound();

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const role = formData.get("role") as "AGENT" | "ADMIN" | "SUPER_ADMIN";

  const france = await countriesRepo.findByCode("FR");
  if (!france) {
    redirect(`/admin-access/${token}?error=${encodeURIComponent("Pays par défaut introuvable en base.")}`);
  }

  try {
    await bootstrapAdminAccount({ email, password, name, role, countryId: france!.id });
  } catch (error) {
    const message = error instanceof AuthError ? error.message : "Création impossible.";
    redirect(`/admin-access/${token}?error=${encodeURIComponent(message)}`);
  }

  redirect(`/admin-access/${token}?created=${encodeURIComponent(email)}`);
}

export default function AdminBootstrapPage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { error?: string; created?: string };
}) {
  if (!isValidBootstrapToken(params.token)) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">Lentific · accès restreint</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Créer un compte back-office</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Ce lien crée directement un compte agent, administrateur ou super administrateur, sans passer par un compte
        existant. Garde-le secret : quiconque le possède peut créer un super administrateur.
      </p>

      <Card className="mt-6">
        {searchParams.created && (
          <p className="mb-4 rounded-lg bg-success/15 px-3 py-2 text-sm text-success">
            Compte créé pour {searchParams.created}. La personne peut maintenant se connecter depuis /login.
          </p>
        )}
        {searchParams.error && (
          <p className="mb-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">{searchParams.error}</p>
        )}
        <form action={createAccountAction} className="grid gap-4">
          <input type="hidden" name="token" value={params.token} />
          <label className="grid gap-1 text-sm text-ink-soft">
            Nom
            <input type="text" name="name" required className="rounded-lg border border-line px-3 py-2.5 text-ink" />
          </label>
          <label className="grid gap-1 text-sm text-ink-soft">
            E-mail
            <input type="email" name="email" required className="rounded-lg border border-line px-3 py-2.5 text-ink" />
          </label>
          <label className="grid gap-1 text-sm text-ink-soft">
            Mot de passe (8 caractères minimum)
            <input
              type="password"
              name="password"
              required
              minLength={8}
              className="rounded-lg border border-line px-3 py-2.5 text-ink"
            />
          </label>
          <label className="grid gap-1 text-sm text-ink-soft">
            Rôle
            <select name="role" defaultValue="AGENT" className="rounded-lg border border-line px-3 py-2.5 text-ink">
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <button className="mt-2 rounded-lg bg-yellow px-4 py-2.5 text-sm font-semibold text-ink hover:bg-yellow-ink">
            Créer le compte
          </button>
        </form>
      </Card>
    </main>
  );
}
