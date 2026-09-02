import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@fintech/database";
import { signUp, SESSION_COOKIE_NAME, AuthError } from "@fintech/auth";
import { Card } from "@fintech/ui";

async function signupAction(formData: FormData) {
  "use server";

  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string)?.trim();
  const role = formData.get("role") as "BORROWER" | "INVESTOR";

  try {
    const france = await prisma.country.findUniqueOrThrow({ where: { code: "FR" } });
    const { token } = await signUp({ email, password, name, role, countryId: france.id });

    cookies().set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  } catch (error) {
    const message = error instanceof AuthError ? error.message : "Impossible de créer le compte.";
    redirect(`/signup?error=${encodeURIComponent(message)}&role=${role}`);
  }

  redirect(role === "INVESTOR" ? "/investor/dashboard" : "/dashboard");
}

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string; role?: string };
}) {
  const defaultRole = searchParams.role === "INVESTOR" ? "INVESTOR" : "BORROWER";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">Lentific</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Créer un compte</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Déjà inscrit ? <a href="/login" className="text-brand-ink underline">Se connecter</a>.
      </p>

      <Card className="mt-6">
        {searchParams.error && (
          <p className="mb-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">{searchParams.error}</p>
        )}
        <form action={signupAction} className="grid gap-4">
          <div className="grid grid-cols-2 gap-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
              <input type="radio" name="role" value="BORROWER" defaultChecked={defaultRole === "BORROWER"} />
              Emprunteur
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
              <input type="radio" name="role" value="INVESTOR" defaultChecked={defaultRole === "INVESTOR"} />
              Investisseur
            </label>
          </div>
          <label className="grid gap-1 text-sm text-ink-soft">
            Nom
            <input name="name" required className="rounded-lg border border-line px-3 py-2.5 text-ink" />
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
          <button className="mt-2 rounded-lg bg-yellow px-4 py-2.5 text-sm font-semibold text-ink hover:bg-yellow-ink">
            Créer mon compte
          </button>
        </form>
      </Card>
    </main>
  );
}
