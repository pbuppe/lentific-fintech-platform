import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@fintech/database";
import { Card, StatusPill } from "@fintech/ui";
import { getCurrentUser } from "../../../lib/session";

const ADMIN_ROLES = ["AGENT", "ADMIN", "SUPER_ADMIN"];

export default async function AdminIntroductionsPage() {
  const user = await getCurrentUser();
  if (!user || !ADMIN_ROLES.includes(user.role)) redirect("/login");
  const t = await getTranslations("IntroductionsPage");

  const introductions = await prisma.introductionRequest.findMany({
    where: { status: "PAID" },
    include: { requester: true, targetUser: true },
    orderBy: { paidAt: "desc" },
  });

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
        {introductions.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-soft">{t("empty")}</p>
          </Card>
        ) : (
          introductions.map((r) => (
            <Card key={r.id}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-ink">
                  <span className="font-semibold">{r.requester.name ?? r.requester.email}</span>
                  {" → "}
                  <span className="font-semibold">{r.targetUser.name ?? r.targetUser.email}</span>
                </p>
                <StatusPill tone="ok">{t("paid")}</StatusPill>
              </div>
              <p className="mt-1 text-xs text-ink-faint">
                {r.targetType === "APPLICATION" ? t("investorToBorrower") : t("borrowerToInvestor")}{" "}
                · {r.paidAt?.toLocaleDateString("fr-FR")}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
