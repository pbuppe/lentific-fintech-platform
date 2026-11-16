import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { countriesRepo } from "@fintech/database";
import { SUPPORTED_COUNTRIES, PRIMARY_COUNTRIES } from "../../../i18n/countries";
import { getPreferredCountry } from "../../../lib/country";
import { signUp, SESSION_COOKIE_NAME, AuthError } from "@fintech/auth";
import { Card } from "@fintech/ui";

async function signupAction(formData: FormData) {
  "use server";

  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string)?.trim();
  const role = formData.get("role") as "BORROWER" | "INVESTOR";
  // Pays du compte (2026-11-16 : ouverture à tous les pays proposés, hors Afrique).
  const countryInput = String(formData.get("country") ?? "FR").toUpperCase();
  const countryCode = (SUPPORTED_COUNTRIES as readonly string[]).includes(countryInput) ? countryInput : "FR";

  try {
    // Langue active à l'inscription, mémorisée pour que tout document généré
    // plus tard (ex. contrat) — et l'e-mail de confirmation envoyé tout de
    // suite — parte de cette préférence plutôt que du français (§ 2026-09-18).
    const locale = await getLocale();
    const country = await countriesRepo.findOrCreateByCode(countryCode, locale);
    const { token } = await signUp({ email, password, name, role, countryId: country.id, locale });

    cookies().set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  } catch (error) {
    const t = await getTranslations("SignupPage");
    const message = error instanceof AuthError ? error.message : t("genericError");
    redirect(`/signup?error=${encodeURIComponent(message)}&role=${role}`);
  }

  // Nouveau compte = en attente (e-mail à confirmer puis validation admin).
  redirect("/compte-en-attente");
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string; role?: string };
}) {
  const defaultRole = searchParams.role === "INVESTOR" ? "INVESTOR" : "BORROWER";
  const t = await getTranslations("SignupPage");
  const pageLocale = await getLocale();
  const regionNames = new Intl.DisplayNames([pageLocale], { type: "region" });
  const nameOf = (code: string) => regionNames.of(code) ?? code;
  const primary = PRIMARY_COUNTRIES.map((code) => ({ code, name: nameOf(code) }));
  const rest = SUPPORTED_COUNTRIES.filter((c) => !(PRIMARY_COUNTRIES as readonly string[]).includes(c))
    .map((code) => ({ code, name: nameOf(code) }))
    .sort((a, b) => a.name.localeCompare(b.name, pageLocale));
  const countryOptions = [...primary, ...rest];
  const defaultCountry = getPreferredCountry() ?? "FR";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("brand")}</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{t("title")}</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {t("alreadyRegisteredPart1")} <a href="/login" className="text-brand-ink underline">{t("alreadyRegisteredLink")}</a>.
      </p>

      <Card className="mt-6">
        {searchParams.error && (
          <p className="mb-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">{searchParams.error}</p>
        )}
        <form action={signupAction} className="grid gap-4">
          <div className="grid grid-cols-2 gap-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
              <input type="radio" name="role" value="BORROWER" defaultChecked={defaultRole === "BORROWER"} />
              {t("roleBorrower")}
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
              <input type="radio" name="role" value="INVESTOR" defaultChecked={defaultRole === "INVESTOR"} />
              {t("roleInvestor")}
            </label>
          </div>
          <label className="grid gap-1 text-sm text-ink-soft">
            {t("nameLabel")}
            <input name="name" required className="rounded-lg border border-line px-3 py-2.5 text-ink" />
          </label>
          <label className="grid gap-1 text-sm text-ink-soft">
            {t("countryLabel")}
            <select name="country" defaultValue={defaultCountry} className="rounded-lg border border-line bg-white px-3 py-2.5 text-ink">
              {countryOptions.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm text-ink-soft">
            {t("emailLabel")}
            <input type="email" name="email" required className="rounded-lg border border-line px-3 py-2.5 text-ink" />
          </label>
          <label className="grid gap-1 text-sm text-ink-soft">
            {t("passwordLabel")}
            <input
              type="password"
              name="password"
              required
              minLength={8}
              className="rounded-lg border border-line px-3 py-2.5 text-ink"
            />
          </label>
          <button className="mt-2 rounded-lg bg-yellow px-4 py-2.5 text-sm font-semibold text-ink hover:bg-yellow-ink">
            {t("submit")}
          </button>
        </form>
      </Card>
    </main>
  );
}
