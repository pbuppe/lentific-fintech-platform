import { getTranslations } from "next-intl/server";
import { introductionsRepo } from "@fintech/database";
import { getContractDownloadUrl } from "@fintech/contracts";
import { Card } from "@fintech/ui";
import { formalizeDirectLoanAction } from "../../lib/actions/formalizeDirectLoan";

/**
 * Panneau partagé emprunteur/investisseur (§ demande produit 2026-09-18,
 * trigger 1) : une fois une mise en relation payée, permet de formaliser un
 * prêt bilatéral direct (montant/durée/taux) et d'en générer le contrat,
 * alternative au contrat marketplace standard. Utilisé par les deux routes
 * (borrower)/mises-en-relation/[id] et (investor)/investor/mises-en-relation/[id].
 */
export async function DirectLoanFormalizePanel({
  introductionId,
  currentUserId,
  returnPath,
  searchParams,
}: {
  introductionId: string;
  currentUserId: string;
  returnPath: string;
  searchParams: { error?: string; formalized?: string };
}) {
  const t = await getTranslations("DirectLoanFormalize");
  const introduction = await introductionsRepo.findById(introductionId);

  if (!introduction || (introduction.requesterId !== currentUserId && introduction.targetUserId !== currentUserId)) {
    return (
      <Card>
        <p className="text-sm text-ink-soft">{t("notFound")}</p>
      </Card>
    );
  }

  if (introduction.status !== "PAID") {
    return (
      <Card>
        <p className="text-sm text-ink-soft">{t("notPaidYet")}</p>
      </Card>
    );
  }

  const otherParty = introduction.requesterId === currentUserId ? introduction.targetUser : introduction.requester;
  const boundAction = formalizeDirectLoanAction.bind(null, returnPath);

  if (introduction.directLoanAgreement) {
    const agreement = introduction.directLoanAgreement;
    const downloadUrl = agreement.contractStorageKey ? await getContractDownloadUrl(agreement.contractStorageKey) : null;
    return (
      <Card>
        <p className="text-sm text-ink">{t("alreadyFormalized", { name: otherParty.name ?? otherParty.email })}</p>
        <p className="mt-1 text-sm text-ink-soft">
          {t("agreementSummary", { amount: Number(agreement.amount), duration: agreement.durationMonths, rate: Number(agreement.rate) })}
        </p>
        {downloadUrl && (
          <a href={downloadUrl} className="mt-3 inline-block rounded-lg bg-yellow px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-yellow-ink">
            {t("downloadContract")}
          </a>
        )}
      </Card>
    );
  }

  return (
    <Card>
      <p className="text-sm text-ink">{t("intro", { name: otherParty.name ?? otherParty.email })}</p>
      {searchParams.error && (
        <p className="mt-3 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">{searchParams.error}</p>
      )}
      <form action={boundAction} className="mt-4 grid gap-4">
        <input type="hidden" name="introductionRequestId" value={introductionId} />
        <div className="grid grid-cols-3 gap-3">
          <label className="grid gap-1 text-sm text-ink-soft">
            {t("amountLabel")}
            <input type="number" name="amount" min={100} required className="rounded-lg border border-line px-3 py-2.5 text-ink" />
          </label>
          <label className="grid gap-1 text-sm text-ink-soft">
            {t("durationLabel")}
            <input type="number" name="durationMonths" min={1} required className="rounded-lg border border-line px-3 py-2.5 text-ink" />
          </label>
          <label className="grid gap-1 text-sm text-ink-soft">
            {t("rateLabel")}
            <input type="number" name="rate" step="0.1" min={0} required className="rounded-lg border border-line px-3 py-2.5 text-ink" />
          </label>
        </div>
        <p className="text-xs text-ink-faint">{t("disclaimer")}</p>
        <button className="justify-self-start rounded-lg bg-yellow px-4 py-2.5 text-sm font-semibold text-ink hover:bg-yellow-ink">
          {t("submit")}
        </button>
      </form>
    </Card>
  );
}
