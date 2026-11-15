import { getTranslations } from "next-intl/server";
import { prisma } from "@fintech/database";
import { Card, StatusPill } from "@fintech/ui";

/**
 * « Mon dossier » (maquette Lentific) : où en est la vérification d'identité, et
 * liste de toutes les pièces du dossier avec leur état, plus une barre
 * d'avancement « X / Y validées ».
 */
export async function DossierSummary({ userId }: { userId: string }) {
  const t = await getTranslations("BorrowerDocuments.summary");
  const [identityDocs, requests] = await Promise.all([
    prisma.document.findMany({ where: { ownerId: userId, type: "identity" }, orderBy: { version: "desc" } }),
    prisma.documentRequest.findMany({
      where: { targetUserId: userId, status: { not: "CANCELLED" } },
      include: { document: { select: { status: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  const identity = identityDocs.find((d) => d.status === "VERIFIED") ?? identityDocs[0];

  // Étapes de la vérification d'identité, contrôlée à la main par l'équipe.
  const idStep = !identity ? 0 : identity.status === "VERIFIED" ? 3 : identity.status === "REJECTED" ? 0 : 1;
  const idSteps = ["upload", "review", "confirmed"] as const;

  type Item = { key: string; label: string; state: "ok" | "wait" | "miss" | "rejected" };
  const items: Item[] = [];
  if (identity) {
    items.push({
      key: `id-${identity.id}`,
      label: t("identityDoc"),
      state: identity.status === "VERIFIED" ? "ok" : identity.status === "REJECTED" ? "rejected" : "wait",
    });
  } else {
    items.push({ key: "id-missing", label: t("identityDoc"), state: "miss" });
  }
  for (const r of requests) {
    const docStatus = r.document?.status;
    items.push({
      key: r.id,
      label: r.label,
      state: r.status === "PENDING" ? "miss" : docStatus === "VERIFIED" ? "ok" : docStatus === "REJECTED" ? "rejected" : "wait",
    });
  }
  const ok = items.filter((i) => i.state === "ok").length;
  const pct = items.length ? Math.round((ok / items.length) * 100) : 0;
  const tone = { ok: "ok", wait: "pending", miss: "risk", rejected: "risk" } as const;

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1.3fr]">
      <Card>
        <div className="flex items-center justify-between gap-2">
          <p className="font-display text-base font-semibold text-ink">{t("identityTitle")}</p>
          <StatusPill tone={idStep >= 3 ? "ok" : "pending"}>{idStep >= 3 ? t("identityVerified") : t("identityPending")}</StatusPill>
        </div>
        <ol className="mt-4 grid gap-2">
          {idSteps.map((key, i) => {
            const done = i < idStep;
            const current = i === idStep;
            return (
              <li key={key} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${current ? "bg-accent-soft" : "bg-surface-alt"}`}>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    done ? "bg-brand text-white" : current ? "border-2 border-accent bg-white text-accent" : "border-2 border-line bg-white text-ink-faint"
                  }`}
                  aria-hidden
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className="text-sm">
                  <span className="font-semibold text-ink">{t(`idSteps.${key}.title`)}</span>
                  <span className="block text-xs text-ink-faint">{t(`idSteps.${key}.sub`)}</span>
                </span>
              </li>
            );
          })}
        </ol>
        {identity?.status === "REJECTED" && <p className="mt-3 text-xs font-semibold text-accent">{t("identityRejected")}</p>}
        <p className="mt-3 text-xs text-ink-faint">{t("identityNote")}</p>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-2">
          <p className="font-display text-base font-semibold text-ink">{t("checklistTitle")}</p>
          <span className="text-sm text-ink-faint">{t("validatedCount", { ok, total: items.length })}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
        </div>
        <ul className="mt-3 grid gap-2">
          {items.map((i) => (
            <li key={i.key} className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ${i.state === "miss" ? "bg-accent-soft" : "bg-surface-alt"}`}>
              <span className="text-ink">{i.label}</span>
              <StatusPill tone={tone[i.state]}>{t(`state.${i.state}`)}</StatusPill>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
