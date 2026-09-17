import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@fintech/database";
import { submitApplication } from "@fintech/applications";
import { listOpenInvestorListings } from "@fintech/funding";
import { Card } from "@fintech/ui";
import { getCurrentUser } from "../../../lib/session";

async function submitAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const application = await submitApplication({
    borrowerId: user.id,
    productId: formData.get("productId") as string,
    amount: Number(formData.get("amount")),
    durationMonths: Number(formData.get("durationMonths")),
    purpose: formData.get("purpose") as string,
    countryId: user.countryId,
    currencyId: (await prisma.currency.findUniqueOrThrow({ where: { code: "EUR" } })).id,
  });

  redirect(`/dashboard?submitted=${application.reference}`);
}

export default async function DemandePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const t = await getTranslations("BorrowerApplication");
  const [products, investorListings] = await Promise.all([
    prisma.loanProduct.findMany({ where: { active: true } }),
    listOpenInvestorListings(),
  ]);
  const totalAvailable = investorListings.reduce((sum, l) => sum + Number(l.amountAvailable), 0);

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("pageEyebrow")}</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{t("title")}</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {t("profileIntroPart1")}{" "}
        <a href="/onboarding" className="text-brand-ink underline">
          {t("profileIntroLink")}
        </a>{" "}
        {t("profileIntroPart2")}
      </p>

      {totalAvailable > 0 && (
        <div className="mt-4 rounded-lg bg-brand-soft px-4 py-3 text-sm text-brand-ink">
          <span className="font-semibold">{t("availableFundsAmount", { amount: totalAvailable.toLocaleString("fr-FR") })}</span>{" "}
          {t("availableFundsRest", { count: investorListings.length })}{" "}
          <a href="/marketplace" className="underline">{t("availableFundsLink")}</a>.
        </div>
      )}

      <Card className="mt-6">
        {products.length === 0 ? (
          <p className="text-sm text-accent">{t("noActiveProducts")}</p>
        ) : (
          <form action={submitAction} className="grid gap-4">
            <label className="grid gap-1 text-sm text-ink-soft">
              {t("productLabel")}
              <select name="productId" className="rounded-lg border border-line px-3 py-2.5 text-ink">
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {t("productOption", {
                      label: p.code === "PARTICULIER-STANDARD" ? t("productParticulier") : p.code === "PME-STANDARD" ? t("productPME") : p.code,
                      min: Number(p.minAmount).toLocaleString("fr-FR"),
                      max: Number(p.maxAmount).toLocaleString("fr-FR"),
                    })}
                  </option>
                ))}
              </select>
              <span className="text-xs text-ink-faint">{t("productHint")}</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm text-ink-soft">
                {t("amountLabel")}
                <input type="number" name="amount" required min={500} className="rounded-lg border border-line px-3 py-2.5 text-ink" />
              </label>
              <label className="grid gap-1 text-sm text-ink-soft">
                {t("durationLabel")}
                <input type="number" name="durationMonths" required min={3} max={120} className="rounded-lg border border-line px-3 py-2.5 text-ink" />
              </label>
            </div>
            <label className="grid gap-1 text-sm text-ink-soft">
              {t("purposeLabel")}
              <input name="purpose" required className="rounded-lg border border-line px-3 py-2.5 text-ink" />
            </label>
            <button className="mt-2 rounded-lg bg-yellow px-4 py-2.5 text-sm font-semibold text-ink hover:bg-yellow-ink">
              {t("submit")}
            </button>
          </form>
        )}
      </Card>
    </main>
  );
}
