import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { paymentsRepo, prisma } from "@fintech/database";
import { recordRepayment } from "@fintech/payments";
import { Card, StatusPill } from "@fintech/ui";

async function confirmAction(formData: FormData) {
  "use server";
  const repaymentId = formData.get("repaymentId") as string;
  const loanId = formData.get("loanId") as string;
  const userId = formData.get("userId") as string;
  const amount = Number(formData.get("amount"));
  const eur = await prisma.currency.findUniqueOrThrow({ where: { code: "EUR" } });
  await recordRepayment(userId, loanId, repaymentId, amount, eur.id);
  revalidatePath("/echeances");
}

export default async function EcheancesPage() {
  const t = await getTranslations("InstallmentsPage");
  const repayments = await paymentsRepo.listScheduledRepayments().catch(() => []);

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("kicker")}</p>
      <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-lg text-sm text-ink-soft">
        {t("description")}
      </p>

      <div className="mt-6 grid gap-3">
        {repayments.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-soft">{t("empty")}</p>
          </Card>
        ) : (
          repayments.map((r) => {
            const application = r.loan.offer.application;
            const overdue = r.dueDate < new Date();
            return (
              <Card key={r.id} accented={overdue}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-base text-ink">{application.purpose}</p>
                    <p className="text-xs text-ink-faint">
                      {t("dueLabel", { reference: application.reference, date: r.dueDate.toLocaleDateString("fr-FR") })}
                    </p>
                  </div>
                  <StatusPill tone={overdue ? "risk" : "pending"}>
                    {overdue ? t("overdue") : t("upcoming")}
                  </StatusPill>
                </div>
                <p className="mt-2 text-sm text-ink-soft">{Number(r.amount).toLocaleString("fr-FR")} €</p>
                <form action={confirmAction} className="mt-3">
                  <input type="hidden" name="repaymentId" value={r.id} />
                  <input type="hidden" name="loanId" value={r.loanId} />
                  <input type="hidden" name="userId" value={application.borrowerId} />
                  <input type="hidden" name="amount" value={Number(r.amount)} />
                  <button className="rounded-lg bg-yellow px-3.5 py-2 text-xs font-semibold text-ink hover:bg-yellow-ink">
                    {t("confirmPayment")}
                  </button>
                </form>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
