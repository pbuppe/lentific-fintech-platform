import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { completeBorrowerProfile } from "@fintech/users";
import { usersRepo } from "@fintech/database";
import { Card } from "@fintech/ui";
import { getCurrentUser } from "../../../lib/session";

async function saveProfileAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await completeBorrowerProfile(user.id, {
    address: { city: formData.get("city") as string, postalCode: formData.get("postalCode") as string },
    employment: { status: formData.get("employment") as string },
    income: Number(formData.get("income")),
    expenses: Number(formData.get("expenses")),
    existingDebt: Number(formData.get("existingDebt")),
  });

  redirect("/demande");
}

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const t = await getTranslations("BorrowerOnboarding");
  const account = await usersRepo.findById(user.id);
  const profile = account?.borrowerProfile;
  const address = (profile?.address as { city?: string; postalCode?: string } | undefined) ?? {};
  const employment = (profile?.employment as { status?: string } | undefined) ?? {};

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">apps/web · (borrower)</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{t("title")}</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {t("subtitle")}
      </p>
      {profile && (
        <p className="mt-2 text-xs text-ink-faint">
          {t("alreadySaved")}
        </p>
      )}

      <Card className="mt-6">
        <form action={saveProfileAction} className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm text-ink-soft">
              {t("cityLabel")}
              <input name="city" required defaultValue={address.city ?? ""} className="rounded-lg border border-line px-3 py-2.5 text-ink" />
            </label>
            <label className="grid gap-1 text-sm text-ink-soft">
              {t("postalCodeLabel")}
              <input name="postalCode" required defaultValue={address.postalCode ?? ""} className="rounded-lg border border-line px-3 py-2.5 text-ink" />
            </label>
          </div>
          <label className="grid gap-1 text-sm text-ink-soft">
            {t("employmentLabel")}
            <select name="employment" defaultValue={employment.status ?? "employee"} className="rounded-lg border border-line px-3 py-2.5 text-ink">
              <option value="employee">{t("employmentEmployee")}</option>
              <option value="self-employed">{t("employmentSelfEmployed")}</option>
              <option value="business-owner">{t("employmentBusinessOwner")}</option>
              <option value="other">{t("employmentOther")}</option>
            </select>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="grid gap-1 text-sm text-ink-soft">
              {t("incomeLabel")}
              <input type="number" name="income" required min={0} defaultValue={profile ? Number(profile.income) : undefined} className="rounded-lg border border-line px-3 py-2.5 text-ink" />
            </label>
            <label className="grid gap-1 text-sm text-ink-soft">
              {t("expensesLabel")}
              <input type="number" name="expenses" required min={0} defaultValue={profile ? Number(profile.expenses) : undefined} className="rounded-lg border border-line px-3 py-2.5 text-ink" />
            </label>
            <label className="grid gap-1 text-sm text-ink-soft">
              {t("existingDebtLabel")}
              <input type="number" name="existingDebt" required min={0} defaultValue={profile ? Number(profile.existingDebt) : undefined} className="rounded-lg border border-line px-3 py-2.5 text-ink" />
            </label>
          </div>
          <button className="mt-2 rounded-lg bg-yellow px-4 py-2.5 text-sm font-semibold text-ink hover:bg-yellow-ink">
            {t("submit")}
          </button>
        </form>
      </Card>
    </main>
  );
}
