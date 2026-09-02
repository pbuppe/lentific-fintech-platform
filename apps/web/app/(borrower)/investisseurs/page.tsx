import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@fintech/database";
import { listOpenInvestorListings } from "@fintech/funding";
import { requestAndPayIntroduction, listSentBy, INTRODUCTION_FEE } from "@fintech/introductions";
import { Card } from "@fintech/ui";
import { getCurrentUser } from "../../../lib/session";

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
  const eur = await prisma.currency.findUniqueOrThrow({ where: { code: "EUR" } });

  await requestAndPayIntroduction({
    requesterId: user.id,
    targetUserId,
    targetType: "INVESTOR_LISTING",
    targetId,
    currencyId: eur.id,
  });
  revalidatePath("/investisseurs");
}

export default async function InvestisseursPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [listings, sentIntroductions] = await Promise.all([
    listOpenInvestorListings(),
    listSentBy(user.id).catch(() => []),
  ]);
  const paidListingIds = new Set(
    sentIntroductions.filter((r) => r.status === "PAID" && r.targetType === "INVESTOR_LISTING").map((r) => r.targetId)
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">apps/web · (borrower)</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Investisseurs disponibles</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Des particuliers, entreprises et structures publient ici le capital qu&apos;ils sont prêts à prêter.
        Demande à être mis en relation directe (coordonnées échangées immédiatement) pour {INTRODUCTION_FEE} €.
      </p>
      <p className="mt-2 text-xs text-ink-faint">
        Une fois mis en relation, les échanges et l&apos;éventuel prêt se déroulent directement entre toi et
        l&apos;investisseur, hors de la plateforme. Lentific fournit le contact mais n&apos;est pas responsable
        de ce qui se passe ensuite entre vous.
      </p>

      {listings.length === 0 ? (
        <Card className="mt-6">
          <p className="text-sm text-ink-soft">Aucun capital disponible publié pour l&apos;instant.</p>
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
                    {listing.investor.name ?? "Investisseur"}
                    {listing.investor.investorProfile?.verificationStatus === "VERIFIED" && (
                      <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                        Vérifié ✓
                      </span>
                    )}
                  </h3>
                  <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand-ink">
                    Risque {listing.riskAppetite}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-soft">
                  <span className="font-semibold text-ink">{amount.toLocaleString("fr-FR")} €</span> disponibles ·{" "}
                  {rate.toFixed(1)}% · {listing.preferredDurationMonths} mois · environ{" "}
                  {monthly.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €/mois
                </p>

                {alreadyIntroduced ? (
                  <p className="mt-3 text-xs text-success">
                    Mise en relation payée : coordonnées dans{" "}
                    <a href="/mises-en-relation" className="underline">
                      Mes mises en relation
                    </a>
                    .
                  </p>
                ) : (
                  <form action={requestIntroductionAction} className="mt-3">
                    <input type="hidden" name="targetUserId" value={listing.investorId} />
                    <input type="hidden" name="listingId" value={listing.id} />
                    <button className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-brand hover:text-brand-ink">
                      Demander la mise en relation ({INTRODUCTION_FEE} €)
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
