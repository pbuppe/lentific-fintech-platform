import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { listSentBy, listReceivedBy } from "@fintech/introductions";
import { Card } from "@fintech/ui";
import { getCurrentUser } from "../../../lib/session";

export default async function BorrowerIntroductionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const t = await getTranslations("BorrowerIntroductions");
  const [sent, received] = await Promise.all([listSentBy(user.id), listReceivedBy(user.id)]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">apps/web · (borrower)</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{t("title")}</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {t("intro")}
      </p>
      <p className="mt-2 text-xs text-ink-faint">
        {t("disclaimer")}
      </p>

      <h2 className="mt-8 font-display text-lg text-ink">{t("sentHeading")}</h2>
      {sent.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">{t("sentEmpty")}</p>
      ) : (
        <div className="mt-3 grid gap-3">
          {sent.map((r) => (
            <Card key={r.id}>
              <p className="text-sm text-ink">
                <span className="font-semibold">{r.targetUser.name ?? r.targetUser.email}</span>
                {" : "}
                {r.targetType === "INVESTOR_LISTING" ? t("targetTypeInvestor") : t("targetTypeBorrower")}
                {r.targetUser.investorProfile?.verificationStatus === "VERIFIED" && (
                  <span className="ml-2 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                    {t("verified")}
                  </span>
                )}
              </p>
              {r.status === "PAID" ? (
                <>
                  <p className="mt-1 text-sm text-success">
                    {t("contact", { email: r.targetUser.email })}
                    {r.targetUser.phone ? ` · ${r.targetUser.phone}` : ""}
                  </p>
                  <a href={`/mises-en-relation/${r.id}`} className="mt-2 inline-block text-sm text-brand-ink underline">
                    {r.directLoanAgreement ? t("viewDirectLoan") : t("formalizeDirectLoan")}
                  </a>
                </>
              ) : (
                <p className="mt-1 text-xs text-ink-faint">{t("paymentPending")}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      <h2 className="mt-8 font-display text-lg text-ink">{t("receivedHeading")}</h2>
      {received.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">{t("receivedEmpty")}</p>
      ) : (
        <div className="mt-3 grid gap-3">
          {received.map((r) => (
            <Card key={r.id}>
              <p className="text-sm text-ink">
                {t.rich("receivedRequest", {
                  name: (chunks) => <span className="font-semibold">{chunks}</span>,
                  nameValue: r.requester.name ?? r.requester.email,
                })}
              </p>
              {r.status === "PAID" && (
                <>
                  <p className="mt-1 text-sm text-success">
                    {t("contact", { email: r.requester.email })}
                    {r.requester.phone ? ` · ${r.requester.phone}` : ""}
                  </p>
                  <a href={`/mises-en-relation/${r.id}`} className="mt-2 inline-block text-sm text-brand-ink underline">
                    {r.directLoanAgreement ? t("viewDirectLoan") : t("formalizeDirectLoan")}
                  </a>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
