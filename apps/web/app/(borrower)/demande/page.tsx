import { redirect } from "next/navigation";
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

  const [products, investorListings] = await Promise.all([
    prisma.loanProduct.findMany({ where: { active: true } }),
    listOpenInvestorListings(),
  ]);
  const totalAvailable = investorListings.reduce((sum, l) => sum + Number(l.amountAvailable), 0);

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">apps/web · (borrower)</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Déposer une demande</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Complète d&apos;abord{" "}
        <a href="/onboarding" className="text-brand-ink underline">
          ton profil financier
        </a>{" "}
        si ce n&apos;est pas déjà fait : le moteur de risque en a besoin pour analyser ton dossier.
      </p>

      {totalAvailable > 0 && (
        <div className="mt-4 rounded-lg bg-brand-soft px-4 py-3 text-sm text-brand-ink">
          <span className="font-semibold">{totalAvailable.toLocaleString("fr-FR")} €</span> sont actuellement
          disponibles chez {investorListings.length} investisseur{investorListings.length > 1 ? "s" : ""} prêt
          {investorListings.length > 1 ? "s" : ""} à financer un dossier comme le tien,{" "}
          <a href="/marketplace" className="underline">voir le détail</a>.
        </div>
      )}

      <Card className="mt-6">
        {products.length === 0 ? (
          <p className="text-sm text-accent">Aucun produit de financement actif pour l&apos;instant.</p>
        ) : (
          <form action={submitAction} className="grid gap-4">
            <label className="grid gap-1 text-sm text-ink-soft">
              Produit
              <select name="productId" className="rounded-lg border border-line px-3 py-2.5 text-ink">
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code === "PARTICULIER-STANDARD" ? "Particulier : besoin personnel" : p.code === "PME-STANDARD" ? "PME : besoin professionnel" : p.code}
                    {" "}({Number(p.minAmount).toLocaleString("fr-FR")} € – {Number(p.maxAmount).toLocaleString("fr-FR")} €)
                  </option>
                ))}
              </select>
              <span className="text-xs text-ink-faint">Ouvert aux particuliers comme aux professionnels.</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm text-ink-soft">
                Montant (€)
                <input type="number" name="amount" required min={500} className="rounded-lg border border-line px-3 py-2.5 text-ink" />
              </label>
              <label className="grid gap-1 text-sm text-ink-soft">
                Durée (mois)
                <input type="number" name="durationMonths" required min={3} max={120} className="rounded-lg border border-line px-3 py-2.5 text-ink" />
              </label>
            </div>
            <label className="grid gap-1 text-sm text-ink-soft">
              Objet du financement
              <input name="purpose" required className="rounded-lg border border-line px-3 py-2.5 text-ink" />
            </label>
            <button className="mt-2 rounded-lg bg-yellow px-4 py-2.5 text-sm font-semibold text-ink hover:bg-yellow-ink">
              Envoyer ma demande
            </button>
          </form>
        )}
      </Card>
    </main>
  );
}
