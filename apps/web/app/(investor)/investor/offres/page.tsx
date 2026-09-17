import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { publishInvestorListing, listInvestorListingsFor, closeInvestorListing } from "@fintech/funding";
import { Card, StatusPill } from "@fintech/ui";
import { getCurrentUser } from "../../../../lib/session";
import { OfferForm } from "./OfferForm";

async function publishAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await publishInvestorListing(user.id, {
    amountAvailable: Number(formData.get("amount")),
    preferredRate: Number(formData.get("rate")),
    preferredDurationMonths: Number(formData.get("durationMonths")),
    riskAppetite: (formData.get("riskAppetite") as "low" | "moderate" | "high") ?? "moderate",
  });
  revalidatePath("/investor/offres");
  revalidatePath("/marketplace");
  revalidatePath("/");
}

async function closeAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await closeInvestorListing(id);
  revalidatePath("/investor/offres");
  revalidatePath("/marketplace");
  revalidatePath("/");
}

export default async function InvestorOffersPage() {
  const t = await getTranslations("InvestorOffers");
  const RISK_LABEL: Record<string, string> = t.raw("riskLabels");

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const listings = await listInvestorListingsFor(user.id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">apps/web · (investor)</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{t("title")}</h1>
      <p className="mt-2 max-w-xl text-sm text-ink-soft">
        {t("subtitle")}
      </p>

      <Card className="mt-6">
        <OfferForm action={publishAction} />
      </Card>

      <h2 className="mb-3 mt-8 font-display text-lg text-ink">{t("publishedHeading")}</h2>
      {listings.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-soft">{t("empty")}</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <div className="flex items-center justify-between">
                <p className="font-display text-base text-ink">
                  {t("amountAvailable", { amount: Number(listing.amountAvailable).toLocaleString("fr-FR") })}
                </p>
                <StatusPill tone={listing.status === "OPEN" ? "ok" : "pending"}>
                  {listing.status === "OPEN" ? t("statusPublished") : t("statusWithdrawn")}
                </StatusPill>
              </div>
              <p className="mt-1 text-sm text-ink-soft">
                {t("listingDetails", {
                  rate: Number(listing.preferredRate),
                  duration: listing.preferredDurationMonths,
                  risk: RISK_LABEL[listing.riskAppetite] ?? listing.riskAppetite,
                })}
              </p>
              {listing.status === "OPEN" && (
                <form action={closeAction} className="mt-2">
                  <input type="hidden" name="id" value={listing.id} />
                  <button className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-surface-alt">
                    {t("withdrawButton")}
                  </button>
                </form>
              )}
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
