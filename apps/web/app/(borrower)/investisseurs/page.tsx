import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma, subscriptionsRepo } from "@fintech/database";
import { listOpenInvestorListings } from "@fintech/funding";
import { listSentBy } from "@fintech/introductions";
import { requestIntroduction } from "../../../lib/introductionCheckout";
import { commercialPrices } from "../../../lib/price";
import { Card } from "@fintech/ui";
import { getCurrentUser } from "../../../lib/session";
import { SpaceKicker } from "../../components/SpaceKicker";
import { PremiumBanner } from "../../components/PremiumPromo";
import { PaymentNotice } from "../../components/PaymentNotice";

function monthlyPayment(amount: number, durationMonths: number, ratePercent: number) {
  const monthlyRate = ratePercent / 12 / 100;
  if (monthlyRate === 0) return amount / durationMonths;
  return (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -durationMonths));
}

async function requestIntroductionAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const targetUserId = formData.get("targetUserId") as string;
  const targetId = formData.get("listingId") as string;
  let result: Awaited<ReturnType<typeof requestIntroduction>>;
  try {
    result = await requestIntroduction({ userId: user.id, targetUserId, targetType: "INVESTOR_LISTING", targetId, back: "/investisseurs" });
  } catch (error) {
    console.error("[paypal] mise en relation : paiement impossible à démarrer", error);
    redirect("/investisseurs?payment=unavailable");
  }
  if ("redirectTo" in result) redirect(result.redirectTo);
  revalidatePath("/investisseurs");
  redirect(`/investisseurs?introduction=${result.done === "included" ? "included" : "1"}`);
}

export default async function InvestisseursPage({ searchParams }: { searchParams: { payment?: string; introduction?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const t = await getTranslations("BorrowerInvestors");
  const { fee } = await commercialPrices();
  const RISK_LABEL = (await getTranslations("InvestorDashboard")).raw("riskLabel") as Record<string, string>;
  const isPremium = (await subscriptionsRepo.findForUser(user.id))?.status === "ACTIVE";
  const [listings, sentIntroductions] = await Promise.all([
    listOpenInvestorListings(),
    listSentBy(user.id).catch(() => []),
  ]);
  const paidListingIds = new Set(
    sentIntroductions.filter((r) => r.status === "PAID" && r.targetType === "INVESTOR_LISTING").map((r) => r.targetId)
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <SpaceKicker audience="borrower" />
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{t("title")}</h1>
      <div className="mt-4"><PaymentNotice payment={searchParams.payment} introduction={searchParams.introduction} /></div>
      <PremiumBanner className="mt-4" />
      <p className="mt-2 text-sm text-ink-soft">
        {isPremium ? t("introPremium") : t("intro", { fee })}
      </p>
      <p className="mt-2 text-xs text-ink-faint">
        {t("disclaimer")}
      </p>

      {listings.length === 0 ? (
        <Card className="mt-6">
          <p className="text-sm text-ink-soft">{t("empty")}</p>
        </Card>
      ) : (
        <div className="mt-6 grid gap-4">
          {listings.map((listing) => {
            const amount = Number(listing.amountAvailable);
            const rate = Number(listing.preferredRate);
            const monthly = monthlyPayment(amount, listing.preferredDurationMonths, rate);
            const alreadyIntroduced = paidListingIds.has(listing.id);
            return (
              <Card key={listing.id}>
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-display text-lg text-ink">
                    {listing.investor.name ?? t("defaultInvestorName")}
                    {listing.investor.investorProfile?.verificationStatus === "VERIFIED" && (
                      <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                        {t("verified")}
                      </span>
                    )}
                  </h3>
                  <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand-ink">
                    {t("risk", { risk: RISK_LABEL[String(listing.riskAppetite).toLowerCase()] ?? listing.riskAppetite })}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-soft">
                  {t.rich("availability", {
                    amount: (chunks) => <span className="font-semibold text-ink">{chunks}</span>,
                    amountValue: amount.toLocaleString("fr-FR"),
                    rate: rate.toFixed(1),
                    duration: listing.preferredDurationMonths,
                    monthlyValue: monthly.toLocaleString("fr-FR", { maximumFractionDigits: 0 }),
                  })}
                </p>

                {alreadyIntroduced ? (
                  <p className="mt-3 text-xs text-success">
                    {t.rich("alreadyIntroduced", {
                      link: (chunks) => (
                        <a href="/mises-en-relation" className="underline">
                          {chunks}
                        </a>
                      ),
                    })}
                  </p>
                ) : (
                  <form action={requestIntroductionAction} className="mt-3">
                    <input type="hidden" name="targetUserId" value={listing.investorId} />
                    <input type="hidden" name="listingId" value={listing.id} />
                    <button className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-brand hover:text-brand-ink">
                      {isPremium ? t("requestButtonPremium") : t("requestButton", { fee })}
                    </button>
                  </form>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
