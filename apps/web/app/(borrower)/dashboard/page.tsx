import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations, getLocale } from "next-intl/server";
import { listBorrowerApplications, acceptOffer } from "@fintech/applications";
import { payBrokerFeeAction } from "../../../lib/actions/clientInbox";
import { uploadDocument, listMyDocumentRequests } from "@fintech/documents";
import { submitSignedContract, getSignatureForContract } from "@fintech/signatures";
import { recordPriorityFee, isPaypalConfigured } from "@fintech/payments";
import { beginPaypalPayment } from "../../../lib/paypalCheckout";
import { contractsRepo, prisma } from "@fintech/database";
import { getContractDownloadUrl } from "@fintech/contracts";
import { Card, StatusPill } from "@fintech/ui";
import { getCurrentUser } from "../../../lib/session";
import { ApplicationTracker } from "./ApplicationTracker";
import { LoanOverview } from "./LoanOverview";
import { CreditsSummary, toCreditRows } from "./CreditsSummary";
import { PRIORITY_FEE, commercialPrices } from "../../../lib/price";
import { PaymentNotice, PaypalHint } from "../../components/PaymentNotice";
import { PremiumBanner } from "../../components/PremiumPromo";

async function uploadIdentityAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const applicationId = formData.get("applicationId") as string;
  const file = formData.get("identityDoc") as File;
  if (!file || file.size === 0) {
    const t = await getTranslations("BorrowerDashboard");
    redirect(`/dashboard?error=${encodeURIComponent(t("errorChooseFile"))}`);
  }

  const content = Buffer.from(await file.arrayBuffer());
  await uploadDocument({ ownerId: user.id, applicationId, type: "identity", fileName: file.name, content });
  revalidatePath("/dashboard");
}

const PRIORITY_ELIGIBLE_STATUSES = ["SUBMITTED", "KYC_PENDING", "KYC_VERIFIED", "UNDER_REVIEW"];

async function requestPriorityAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const applicationId = formData.get("applicationId") as string;
  const application = await prisma.application.findFirst({ where: { id: applicationId, borrowerId: user.id } });
  if (!application || application.priority || !PRIORITY_ELIGIBLE_STATUSES.includes(application.status)) redirect("/dashboard");
  const eur = await prisma.currency.findUniqueOrThrow({ where: { code: "EUR" } });
  if (isPaypalConfigured()) {
    let url: string;
    try {
      url = await beginPaypalPayment({
        userId: user.id,
        amount: PRIORITY_FEE,
        currencyId: eur.id,
        purpose: "priority",
        targetId: application.id,
        reference: application.reference,
        back: "/dashboard",
      });
    } catch (error) {
      console.error("[paypal] impossible de démarrer le paiement", error);
      redirect("/dashboard?payment=unavailable");
    }
    redirect(url);
  }
  await recordPriorityFee(user.id, applicationId, PRIORITY_FEE, eur.id);
  revalidatePath("/dashboard");
}

async function acceptOfferAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const offerId = formData.get("offerId") as string;
  await acceptOffer(offerId, user.id);
  revalidatePath("/dashboard");
}

async function uploadSignedContractAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const applicationId = formData.get("applicationId") as string;
  const signatureId = formData.get("signatureId") as string;
  const contractId = formData.get("contractId") as string;
  const file = formData.get("signedContract") as File;
  if (!file || file.size === 0) {
    const t = await getTranslations("BorrowerDashboard");
    redirect(`/dashboard?error=${encodeURIComponent(t("errorChooseFile"))}`);
  }

  const content = Buffer.from(await file.arrayBuffer());
  await submitSignedContract({
    signatureId,
    contractId,
    ownerId: user.id,
    applicationId,
    fileName: file.name,
    content,
  });
  revalidatePath("/dashboard");
}

export default async function BorrowerDashboard({ searchParams }: { searchParams: { paid?: string; error?: string; payment?: string; priority?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const t = await getTranslations("BorrowerDashboard");
  const STATUS_LABEL = t.raw("statusLabel") as Record<string, string>;
  const locale = await getLocale();
  const prices = await commercialPrices();
  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
  const money = (value: number | string, currency: string) =>
    new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(value));

  const [applications, documentRequests] = await Promise.all([
    listBorrowerApplications(user.id),
    listMyDocumentRequests(user.id),
  ]);
  const pendingDocumentRequests = documentRequests.filter((r) => r.status === "PENDING");

  // Retrouve, pour chaque demande dont l'offre a été acceptée, la signature en
  // attente (le contrat n'a pas de relation Prisma directe vers Loan, voir
  // packages/applications getApplicationDetail pour la même traversée).
  const signatureByApplication = new Map<string, string>();
  const contractUrlByApplication = new Map<string, string>();
  for (const app of applications) {
    const contractId = app.offers.find((o) => o.status === "ACCEPTED")?.loan?.contractId;
    if (!contractId) continue;
    const signature = await getSignatureForContract(contractId);
    if (signature) signatureByApplication.set(app.id, signature.id);
    const contract = await contractsRepo.findById(contractId);
    if (contract) contractUrlByApplication.set(app.id, await getContractDownloadUrl(contract.storageKey));
  }

  // Cartes d'alerte en tête de page (maquette Lentific) : ce que le client doit faire maintenant.
  const pendingFees = applications.flatMap((a) => a.brokerFees.filter((f) => f.status === "PENDING").map((f) => ({ ...f, currency: a.currency.code })));
  const alerts: Array<{ key: string; tone: "urgent" | "info"; eyebrow: string; title: string; body?: string; cta: string; href: string }> = [];
  for (const r of pendingDocumentRequests.slice(0, 3)) {
    alerts.push({
      key: `doc-${r.id}`,
      tone: "urgent",
      eyebrow: t("alerts.docEyebrow"),
      title: r.label,
      body: r.dueAt ? t("alerts.docDue", { date: dateFmt.format(r.dueAt) }) : r.instructions ?? undefined,
      cta: t("alerts.docCta"),
      href: "/documents",
    });
  }
  for (const fee of pendingFees) {
    alerts.push({
      key: `fee-${fee.id}`,
      tone: "info",
      eyebrow: t("alerts.feeEyebrow"),
      title: `${t(`feeKind.${fee.kind}`)} · ${money(fee.amount.toString(), fee.currency)}`,
      body: t("alerts.feeDue", { date: dateFmt.format(fee.dueDate) }),
      cta: t("alerts.feeCta"),
      href: "/paiements",
    });
  }
  for (const app of applications) {
    if (app.offers.some((o) => o.status === "PENDING")) {
      alerts.push({ key: `offer-${app.id}`, tone: "info", eyebrow: t("alerts.offerEyebrow"), title: app.reference, body: t("alerts.offerBody"), cta: t("alerts.offerCta"), href: `#${app.id}` });
    }
    if (app.status === "OFFER_ACCEPTED" && !app.documents.some((d) => d.type === "signed_contract")) {
      alerts.push({ key: `sign-${app.id}`, tone: "urgent", eyebrow: t("alerts.signEyebrow"), title: app.reference, body: t("alerts.signBody"), cta: t("alerts.signCta"), href: `#${app.id}` });
    }
  }

  // Crédits dont les fonds sont versés et confirmés : vue « Mon crédit ».
  const disbursedLoans = applications.flatMap((app) => {
    const offer = app.offers.find((o) => o.status === "ACCEPTED");
    if (!offer || app.disbursement?.status !== "CONFIRMED") return [];
    return [{
      reference: app.reference,
      amount: Number(offer.amount),
      rate: Number(offer.rate),
      months: offer.durationMonths,
      start: app.disbursement.fundsDate,
      currency: app.currency.code,
      repayments: offer.loan?.repayments ?? [],
    }];
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-brand">
            {t("greeting", { name: user.name?.split(" ")[0] ?? "" })}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">{t("greetingSub")}</p>
        </div>
        <a href="/demande" className="rounded-lg bg-yellow px-4 py-2 text-sm font-semibold text-ink hover:bg-yellow-ink">
          {t("newRequest")}
        </a>
      </div>

      {searchParams.paid && (
        <p role="status" className="mb-6 rounded-lg bg-success-soft px-4 py-3 text-sm text-success">{t("feePaid")}</p>
      )}
      <PaymentNotice payment={searchParams.payment} priority={searchParams.priority} />
      {searchParams.error && (
        <p role="alert" className="mb-6 rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent">{searchParams.error}</p>
      )}

      <PremiumBanner className="mb-6" />
      {alerts.length > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {alerts.map((a) => (
            <a
              key={a.key}
              href={a.href}
              className={`block rounded-xl border p-4 transition hover:shadow-sm ${
                a.tone === "urgent" ? "border-accent/30 bg-accent-soft" : "border-line bg-surface-alt"
              }`}
            >
              <span className={`text-[11px] font-bold uppercase tracking-wide ${a.tone === "urgent" ? "text-accent" : "text-yellow-ink"}`}>
                {a.eyebrow}
              </span>
              <span className="mt-1 block font-display text-base font-semibold text-ink">{a.title}</span>
              {a.body && <span className="mt-1 block text-xs text-ink-soft">{a.body}</span>}
              <span className="mt-2 block text-sm font-semibold text-brand-ink">{a.cta} →</span>
            </a>
          ))}
        </div>
      )}

      <CreditsSummary rows={toCreditRows(applications)} />

      {disbursedLoans.length > 0 && (
        <div className="mb-6 grid gap-4">
          {disbursedLoans.map((l) => (
            <LoanOverview key={l.reference} {...l} />
          ))}
        </div>
      )}

      {applications.length > 0 && <h2 className="mb-3 font-display text-lg font-semibold text-ink">{t("myApplications")}</h2>}

      {applications.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-soft">
            {t("noApplications")}{" "}
            <a href="/demande" className="text-brand-ink underline">
              {t("noApplicationsLink")}
            </a>
            .
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => {
            const identityDoc = app.documents.find((d) => d.type === "identity");
            const identityNeedsUpload =
              (app.status === "SUBMITTED" || app.status === "KYC_PENDING") &&
              (!identityDoc || identityDoc.status === "REJECTED");
            const publishedOffer = app.offers.find((o) => o.status === "PENDING");
            const acceptedOffer = app.offers.find((o) => o.status === "ACCEPTED");
            const signedContractDoc = app.documents.find((d) => d.type === "signed_contract");
            const needsSignatureUpload = app.status === "OFFER_ACCEPTED" && !signedContractDoc && acceptedOffer?.loan;

            return (
              <Card key={app.id} accented id={app.id} className="scroll-mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg text-ink">{app.reference}</h3>
                  <StatusPill tone={app.status === "REJECTED" ? "risk" : app.status === "CONTRACT_SIGNED" || app.status === "DISBURSED" ? "ok" : "pending"}>
                    {STATUS_LABEL[app.status] ?? app.status}
                  </StatusPill>
                </div>
                <p className="mt-1 text-sm text-ink-soft">
                  {t("amountDurationPurpose", { amount: Number(app.amount).toLocaleString(locale), duration: app.durationMonths, purpose: app.purpose })}
                </p>
                <p className="text-xs text-ink-faint">{t("submittedOn", { date: dateFmt.format(app.createdAt) })}</p>

                <ApplicationTracker
                  status={app.status}
                  pendingDocs={pendingDocumentRequests.length}
                  fundsConfirmed={app.disbursement?.status === "CONFIRMED"}
                  stopped={app.status === "REJECTED" || app.status === "CANCELLED"}
                />

                {app.priority ? (
                  <p className="mt-2 text-xs font-semibold text-yellow-ink">
                    {t("priorityBadge")}
                    {app.slaBreachedAt
                      ? t("slaBreached")
                      : app.slaDeadline
                        ? t("slaDeadline", { date: app.slaDeadline.toLocaleString("fr-FR") })
                        : ""}
                  </p>
                ) : (
                  PRIORITY_ELIGIBLE_STATUSES.includes(app.status) && (
                    <form action={requestPriorityAction} className="mt-3">
                      <input type="hidden" name="applicationId" value={app.id} />
                      <button className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-yellow hover:text-yellow-ink">
                        {t("priorityButton", { fee: prices.priority })}
                      </button>
                    </form>
                  )
                )}

                {identityNeedsUpload && (
                  <form action={uploadIdentityAction} className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-surface-alt p-3">
                    <input type="hidden" name="applicationId" value={app.id} />
                    <span className="text-xs text-ink-soft">
                      {identityDoc?.status === "REJECTED"
                        ? t("identityRejectedPrompt")
                        : t("identityNeededPrompt")}
                    </span>
                    <input type="file" name="identityDoc" required className="text-xs" />
                    <button className="rounded-lg bg-yellow px-3 py-1.5 text-xs font-semibold text-ink hover:bg-yellow-ink">
                      {t("send")}
                    </button>
                  </form>
                )}

                {!identityNeedsUpload && identityDoc?.status === "UPLOADED" && (
                  <p className="mt-3 text-xs text-ink-faint">{t("identityUploadedPending")}</p>
                )}

                {publishedOffer && (
                  <div className="mt-3 rounded-lg bg-brand-soft p-3">
                    <p className="text-sm text-brand-ink">
                      {t("offerProposed", { amount: Number(publishedOffer.amount).toLocaleString("fr-FR"), duration: publishedOffer.durationMonths, rate: Number(publishedOffer.rate) })}
                    </p>
                    <form action={acceptOfferAction} className="mt-2">
                      <input type="hidden" name="offerId" value={publishedOffer.id} />
                      <button className="rounded-lg bg-yellow px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-yellow-ink">
                        {t("acceptOffer")}
                      </button>
                    </form>
                  </div>
                )}

                {needsSignatureUpload && acceptedOffer?.loan && (
                  <div className="mt-3 rounded-lg bg-surface-alt p-3">
                    {contractUrlByApplication.has(app.id) && (
                      <a
                        href={contractUrlByApplication.get(app.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-brand-ink underline"
                      >
                        {t("downloadContract")}
                      </a>
                    )}
                    <form action={uploadSignedContractAction} className="mt-2 flex flex-wrap items-center gap-2">
                      <input type="hidden" name="applicationId" value={app.id} />
                      <input type="hidden" name="signatureId" value={signatureByApplication.get(app.id) ?? ""} />
                      <input type="hidden" name="contractId" value={acceptedOffer.loan.contractId ?? ""} />
                      <span className="text-xs text-ink-soft">
                        {t("signInstructions")}
                      </span>
                      <input type="file" name="signedContract" required className="text-xs" />
                      <button className="rounded-lg bg-yellow px-3 py-1.5 text-xs font-semibold text-ink hover:bg-yellow-ink">
                        {t("send")}
                      </button>
                    </form>
                  </div>
                )}

                {signedContractDoc && app.status === "OFFER_ACCEPTED" && (
                  <p className="mt-3 text-xs text-ink-faint">{t("contractUploadedPending")}</p>
                )}

                {app.status === "CONTRACT_SIGNED" && (
                  <p className="mt-3 text-xs text-success">
                    {t("contractConfirmed")}
                  </p>
                )}

                {app.status === "CONTRACT_SIGNED" && app.disbursement?.status !== "CONFIRMED" && (
                  <p className="mt-3 rounded-lg bg-surface-alt px-3 py-2 text-sm text-ink-soft">{t("fundsPending")}</p>
                )}

                {app.disbursement?.status === "CONFIRMED" && (
                  <div className="mt-3 rounded-lg bg-brand p-4 text-white">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-white/80">{t("fundsDisbursedKicker")}</p>
                    <p className="font-display text-2xl font-semibold">
                      {money((acceptedOffer?.amount ?? app.amount).toString(), app.currency.code)}
                    </p>
                    <p className="text-sm text-white/90">
                      {t("fundsDisbursedOn", {
                        date: dateFmt.format(app.disbursement.fundsDate),
                        beneficiary: t(`fundsBeneficiary.${app.disbursement.beneficiary}`),
                      })}
                    </p>
                    <p className="mt-2 rounded-md bg-white/10 px-3 py-2 text-sm">
                      {t(`fundsAvailability.${app.disbursement.availability}`)}
                    </p>
                  </div>
                )}

                {app.brokerFees.length > 0 && (
                  <div className="mt-3 grid gap-2">
                    {app.brokerFees.map((fee) => (
                      <div key={fee.id} className="rounded-lg border border-line bg-surface-alt p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-ink">
                            {t(`feeKind.${fee.kind}`)} · {money(fee.amount.toString(), app.currency.code)}
                          </p>
                          <StatusPill tone={fee.status === "PAID" ? "ok" : "pending"}>
                            {fee.status === "PAID" ? t("feeStatusPaid") : t("feeStatusDue", { date: dateFmt.format(fee.dueDate) })}
                          </StatusPill>
                        </div>
                        {fee.status === "PENDING" && (
                          <>
                            <p className="mt-1 text-xs text-ink-soft">{t("feeExplanation")}</p>
                            <form action={payBrokerFeeAction} className="mt-2">
                              <input type="hidden" name="feeId" value={fee.id} />
                              <input type="hidden" name="back" value="/dashboard" />
                              <button className="rounded-lg bg-yellow px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-yellow-ink">
                                {t("payFee")}
                              </button>
                              <PaypalHint />
                            </form>
                          </>
                        )}
                      </div>
                    ))}
                    <p className="text-xs text-ink-faint">{t("feeSafetyNote")}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
