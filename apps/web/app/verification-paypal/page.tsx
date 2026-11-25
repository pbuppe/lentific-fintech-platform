import { notFound } from "next/navigation";
import { getPaypalPayeeAccount, isPaypalConfigured } from "@fintech/payments";
import { getCurrentUser } from "../../lib/session";

/**
 * PAGE TEMPORAIRE (2026-11-25) : affiche l'adresse e-mail du compte PayPal
 * relié aux clés enregistrées sur Vercel, que l'on ne peut plus relire.
 * Réservée au SUPER_ADMIN connecté sur ce site ; tout autre visiteur voit
 * une page introuvable. Aucun paiement : commande de 1 EUR jamais validée.
 * À SUPPRIMER une fois l'adresse notée.
 */
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function PaypalAccountCheckPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") notFound();

  let content: React.ReactNode;
  if (!isPaypalConfigured()) {
    content = <p>Aucune clé PayPal n'est configurée sur ce site : le paiement y est simulé.</p>;
  } else {
    try {
      const account = await getPaypalPayeeAccount();
      content = (
        <dl className="grid gap-2">
          <dt className="text-sm text-ink-soft">Adresse e-mail du compte PayPal</dt>
          <dd className="text-xl font-semibold">{account.email ?? "(PayPal ne l'a pas renvoyée)"}</dd>
          <dt className="mt-3 text-sm text-ink-soft">Identifiant marchand</dt>
          <dd>{account.merchantId ?? "—"}</dd>
          <dt className="mt-3 text-sm text-ink-soft">Mode</dt>
          <dd>{account.mode === "live" ? "Réel (live)" : "Test (sandbox)"}</dd>
        </dl>
      );
    } catch (error) {
      content = <p>PayPal a refusé la vérification : {error instanceof Error ? error.message : "erreur inconnue"}</p>;
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-display text-2xl font-semibold text-brand">Compte PayPal du site</h1>
      <div className="mt-6 rounded-lg border p-6">{content}</div>
      <p className="mt-6 text-sm text-ink-soft">
        Aucun paiement n'a été fait : une commande de 1 € a été préparée chez PayPal mais jamais validée, elle expire seule.
      </p>
    </main>
  );
}
