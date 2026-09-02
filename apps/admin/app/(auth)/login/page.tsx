import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signIn, signOut, SESSION_COOKIE_NAME, AuthError } from "@fintech/auth";
import { Card } from "@fintech/ui";

const ADMIN_ROLES = ["AGENT", "ADMIN", "SUPER_ADMIN"];

async function loginAction(formData: FormData) {
  "use server";

  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  try {
    const { token, user } = await signIn({ email, password });

    if (!ADMIN_ROLES.includes(user.role)) {
      await signOut(token);
      redirect("/login?error=" + encodeURIComponent("Ce compte n'a pas accès au back-office."));
    }

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

  redirect("/");
}

export default function AdminLoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">Lentific · Back-office</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Connexion agent</h1>

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
