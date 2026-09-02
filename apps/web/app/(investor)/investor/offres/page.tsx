import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { publishInvestorListing, listInvestorListingsFor, closeInvestorListing } from "@fintech/funding";
import { Card, StatusPill } from "@fintech/ui";
import { getCurrentUser } from "../../../../lib/session";
import { OfferForm } from "./OfferForm";

const RISK_LABEL: Record<string, string> = { low: "Faible uniquement", moderate: "Modéré et faible", high: "Tous niveaux" };

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
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const listings = await listInvestorListingsFor(user.id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">apps/web · (investor)</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Mes offres de capital</h1>
      <p className="mt-2 max-w-xl text-sm text-ink-soft">
        Publie un montant que tu es prêt à prêter, avec le taux et la durée que tu préfères : les
        emprunteurs le voient directement sur la marketplace, avant même de déposer leur demande.
      </p>

      <Card className="mt-6">
        <OfferForm action={publishAction} />
      </Card>

      <h2 className="mb-3 mt-8 font-display text-lg text-ink">Offres publiées</h2>
      {listings.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-soft">Aucune offre publiée pour l&apos;instant.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <div className="flex items-center justify-between">
                <p className="font-display text-base text-ink">
                  {Number(listing.amountAvailable).toLocaleString("fr-FR")} € disponibles
                </p>
                <StatusPill tone={listing.status === "OPEN" ? "ok" : "pending"}>
                  {listing.status === "OPEN" ? "Publiée" : "Retirée"}
                </StatusPill>
              </div>
              <p className="mt-1 text-sm text-ink-soft">
                Taux souhaité {Number(listing.preferredRate)}% · Durée préférée {listing.preferredDurationMonths} mois ·
                Risque : {RISK_LABEL[listing.riskAppetite] ?? listing.riskAppetite}
              </p>
              {listing.status === "OPEN" && (
                <form action={closeAction} className="mt-2">
                  <input type="hidden" name="id" value={listing.id} />
                  <button className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-surface-alt">
                    Retirer cette offre
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
