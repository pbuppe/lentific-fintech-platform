import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signIn, SESSION_COOKIE_NAME, AuthError } from "@fintech/auth";
import { Card } from "@fintech/ui";

async function loginAction(formData: FormData) {
  "use server";

  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  let role: string;
  try {
    const { token, user } = await signIn({ email, password });
    role = user.role;

    cookies().set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  } catch (error) {
    const message = error instanceof AuthError ? error.message : "Connexion impossible.";
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }

  if (role === "INVESTOR") redirect("/investor/dashboard");
  if (role === "BORROWER") redirect("/dashboard");
  // Agent/Admin/Super Admin : le compte existe mais sa place est dans le back-office.
  redirect((process.env.ADMIN_URL ?? "http://localhost:3001") + "/");
}

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">Lentific</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Se connecter</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Pas encore de compte ? <a href="/signup" className="text-brand-ink underline">S&apos;inscrire</a>.
      </p>

      <Card className="mt-6">
        {searchParams.error && (
          <p className="mb-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">{searchParams.error}</p>
        )}
        <form action={loginAction} className="grid gap-4">
          <label className="grid gap-1 text-sm text-ink-soft">
            E-mail
            <input type="email" name="email" required className="rounded-lg border border-line px-3 py-2.5 text-ink" />
          </label>
          <label className="grid gap-1 text-sm text-ink-soft">
            Mot de passe
            <input type="password" name="password" required className="rounded-lg border border-line px-3 py-2.5 text-ink" />
          </label>
          <button className="mt-2 rounded-lg bg-yellow px-4 py-2.5 text-sm font-semibold text-ink hover:bg-yellow-ink">
            Se connecter
          </button>
        </form>
      </Card>
    </main>
  );
}
