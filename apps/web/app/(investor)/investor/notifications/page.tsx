import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@fintech/database";
import { Card } from "@fintech/ui";
import { getCurrentUser } from "../../../../lib/session";

export default async function InvestorNotificationsPage() {
  const t = await getTranslations("InvestorNotifications");
  const EVENT_LABEL: Record<string, string> = t.raw("eventLabels");

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">apps/web · (investor)</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{t("title")}</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {t("subtitle")}
      </p>

      {notifications.length === 0 ? (
        <Card className="mt-6">
          <p className="text-sm text-ink-soft">{t("empty")}</p>
        </Card>
      ) : (
        <div className="mt-6 grid gap-2">
          {notifications.map((n) => (
            <Card key={n.id}>
              <p className="text-sm text-ink">{EVENT_LABEL[n.event.replace(/\./g, "_")] ?? n.event}</p>
              <p className="mt-1 text-xs text-ink-faint">{n.createdAt.toLocaleString("fr-FR")}</p>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
