import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma, auditLogsRepo } from "@fintech/database";
import { Card, StatusPill } from "@fintech/ui";
import { getCurrentUser } from "../../../lib/session";

/**
 * Demandes d'étude gratuite reçues par le site vitrine (2026-11-14, maquette
 * Lentific). L'équipe rappelle le prospect, suit le statut et garde une note.
 */

const STATUSES = ["NEW", "CONTACTED", "CONVERTED", "CLOSED"] as const;
const STAFF = ["ADMIN", "SUPER_ADMIN"];

async function requireStaff() {
  const user = await getCurrentUser();
  if (!user || !STAFF.includes(user.role)) redirect("/");
  return user;
}

async function updateAction(formData: FormData) {
  "use server";
  const user = await requireStaff();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const filter = String(formData.get("filter") ?? "open");
  if (!(STATUSES as readonly string[]).includes(status)) redirect(`/prospects?filter=${filter}`);
  const note = String(formData.get("note") ?? "").trim().slice(0, 2000);
  const before = await prisma.contactRequest.findUnique({ where: { id } });
  if (!before) redirect(`/prospects?filter=${filter}`);
  await prisma.contactRequest.update({
    where: { id },
    data: { status: status as (typeof STATUSES)[number], note: note || null, handledById: user.id },
  });
  await auditLogsRepo.create({ userId: user.id, action: "contact_request.updated", entity: `ContactRequest:${id}`, before: { status: before.status }, after: { status } });
  revalidatePath("/prospects");
  redirect(`/prospects?filter=${filter}&done=1#${id}`);
}

export default async function ProspectsPage({ searchParams }: { searchParams: { filter?: string; done?: string } }) {
  await requireStaff();
  const t = await getTranslations("ProspectsPage");
  const locale = await getLocale();
  const dt = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const money = (v: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
  const filter = searchParams.filter === "all" ? "all" : searchParams.filter === "closed" ? "closed" : "open";

  const where =
    filter === "open" ? { status: { in: ["NEW", "CONTACTED"] as ("NEW" | "CONTACTED")[] } } : filter === "closed" ? { status: { in: ["CONVERTED", "CLOSED"] as ("CONVERTED" | "CLOSED")[] } } : {};
  const [requests, counts] = await Promise.all([
    prisma.contactRequest.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.contactRequest.groupBy({ by: ["status"], _count: true }),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const tone = { NEW: "risk", CONTACTED: "pending", CONVERTED: "ok", CLOSED: "pending" } as const;

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("kicker")}</p>
      <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-xl text-sm text-ink-soft">{t("description")}</p>

      <div className="mt-5 flex flex-wrap gap-2 text-sm">
        {STATUSES.map((s) => (
          <span key={s} className="rounded-full bg-surface-alt px-3 py-1 text-ink-soft">
            {t(`status.${s}`)} : <span className="font-semibold text-ink">{count(s)}</span>
          </span>
        ))}
      </div>
      <div className="mt-4 inline-flex gap-1 rounded-lg bg-surface-alt p-1">
        {(["open", "closed", "all"] as const).map((k) => (
          <a key={k} href={`/prospects?filter=${k}`} className={`rounded-md px-3 py-1.5 text-sm font-semibold ${filter === k ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"}`}>
            {t(`filters.${k}`)}
          </a>
        ))}
      </div>

      {searchParams.done && <p role="status" className="mt-4 rounded-lg bg-success-soft px-3 py-2 text-sm text-success">{t("saved")}</p>}

      <div className="mt-5 grid gap-3">
        {requests.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-soft">{t("empty")}</p>
          </Card>
        ) : (
          requests.map((r) => (
            <section key={r.id} id={r.id} className="scroll-mt-6">
              <Card accented={r.status === "NEW"}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-base text-ink">{r.name}</p>
                    <p className="text-sm">
                      <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`} className="font-semibold text-brand-ink underline">{r.phone}</a>
                      {" · "}
                      <a href={`mailto:${r.email}`} className="text-brand-ink underline">{r.email}</a>
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusPill tone={tone[r.status]}>{t(`status.${r.status}`)}</StatusPill>
                    <p className="mt-1 text-xs text-ink-faint">{dt.format(r.createdAt)}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-ink">
                  <span className="font-semibold">{t(`projects.${r.project}` as "projects.OTHER")}</span>
                  {r.amount != null && <span className="text-ink-soft"> · {money(Number(r.amount))}</span>}
                  {r.locale && <span className="text-xs text-ink-faint"> · {r.locale.toUpperCase()}</span>}
                </p>
                {r.message && <p className="mt-2 whitespace-pre-line rounded-lg bg-surface-alt px-3 py-2 text-sm text-ink-soft">{r.message}</p>}
                <form action={updateAction} className="mt-3 grid gap-2 sm:grid-cols-[180px_1fr_auto] sm:items-end">
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="filter" value={filter} />
                  <label className="grid gap-1 text-xs font-semibold text-ink-soft">
                    {t("statusLabel")}
                    <select name="status" defaultValue={r.status} className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink">
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{t(`status.${s}`)}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-xs font-semibold text-ink-soft">
                    {t("noteLabel")}
                    <input name="note" defaultValue={r.note ?? ""} maxLength={2000} placeholder={t("notePlaceholder")} className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink" />
                  </label>
                  <button className="rounded-lg bg-yellow px-4 py-2 text-sm font-semibold text-ink hover:bg-yellow-ink">{t("save")}</button>
                </form>
              </Card>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
