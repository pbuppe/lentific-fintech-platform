import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@fintech/database";
import { Card, StatusPill } from "@fintech/ui";
import { getCurrentUser } from "../../../lib/session";
import { payBrokerFeeAction } from "../../../lib/actions/clientInbox";
import { PaymentNotice, PaypalHint } from "../../components/PaymentNotice";

/** Paiements de l'emprunteur : honoraires demandés par le cabinet et historique des règlements. */
export default async function PaymentsPage({ searchParams }: { searchParams: { paid?: string; payment?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const t = await getTranslations("ClientPayments");
  const locale = await getLocale();
  const day = new Intl.DateTimeFormat(locale, { dateStyle: "long" });
  const money = (v: number | string, c: string) => new Intl.NumberFormat(locale, { style: "currency", currency: c }).format(Number(v));

  const [fees, payments] = await Promise.all([
    prisma.brokerFeeRequest.findMany({
      where: { userId: user.id, status: { not: "CANCELLED" } },
      include: { application: { select: { reference: true, currency: { select: { code: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      where: { userId: user.id, type: { in: ["fee", "subscription"] }, status: { in: ["COMPLETED", "REFUNDED"] } },
      include: { currency: { select: { code: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);
  const pending = fees.filter((f) => f.status === "PENDING");
  const paidFees = fees.filter((f) => f.status === "PAID");

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("kicker")}</p>
      <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-xl text-sm text-ink-soft">{t("subtitle")}</p>

      {searchParams.paid && (
        <p role="status" className="mt-4 rounded-lg bg-success-soft px-3 py-2 text-sm text-success">{t("paidOk")}</p>
      )}

      <div className="mt-4"><PaymentNotice payment={searchParams.payment} /></div>

      <h2 className="mt-8 font-display text-lg text-ink">{t("pendingHeading")}</h2>
      {pending.length === 0 ? (
        <Card className="mt-3">
          <p className="text-sm text-ink-soft">{t("pendingEmpty")}</p>
        </Card>
      ) : (
        <div className="mt-3 grid gap-3">
          {pending.map((fee) => (
            <Card key={fee.id} accented>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-display text-base font-semibold text-ink">
                    {t(`feeKind.${fee.kind}`)} · {money(fee.amount.toString(), fee.application.currency.code)}
                  </p>
                  <p className="text-xs text-ink-faint">{t("forApplication", { reference: fee.application.reference })}</p>
                </div>
                <StatusPill tone="pending">{t("dueBy", { date: day.format(fee.dueDate) })}</StatusPill>
              </div>
              <p className="mt-2 text-sm text-ink-soft">{t("feeExplanation")}</p>
              <form action={payBrokerFeeAction} className="mt-3">
                <input type="hidden" name="feeId" value={fee.id} />
                <input type="hidden" name="back" value="/paiements" />
                <button className="rounded-lg bg-yellow px-4 py-2 text-sm font-semibold text-ink hover:bg-yellow-ink">{t("pay")}</button>
                <PaypalHint />
              </form>
            </Card>
          ))}
        </div>
      )}

      <h2 className="mt-10 font-display text-lg text-ink">{t("historyHeading")}</h2>
      {payments.length === 0 && paidFees.length === 0 ? (
        <Card className="mt-3">
          <p className="text-sm text-ink-soft">{t("historyEmpty")}</p>
        </Card>
      ) : (
        <Card className="mt-3">
          <ul className="divide-y divide-line">
            {payments.map((p) => {
              const fee = paidFees.find((f) => f.paymentId === p.id);
              return (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                  <span>
                    <span className="font-semibold text-ink">
                      {fee
                        ? `${t(`feeKind.${fee.kind}`)} · ${fee.application.reference}`
                        : p.purpose && ["introduction", "priority", "premium"].includes(p.purpose)
                          ? t(`paymentPurpose.${p.purpose}`)
                          : t(`paymentType.${p.type}`)}
                    </span>
                    <span className="block text-xs text-ink-faint">{day.format(p.capturedAt ?? p.createdAt)}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-ink">{money(p.amount.toString(), p.currency.code)}</span>
                    <StatusPill tone={p.status === "COMPLETED" ? "ok" : p.status === "FAILED" ? "risk" : "pending"}>
                      {t(`paymentStatus.${p.status}`)}
                    </StatusPill>
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <p className="mt-6 text-xs text-ink-faint">{t("safetyNote")}</p>
    </main>
  );
}
