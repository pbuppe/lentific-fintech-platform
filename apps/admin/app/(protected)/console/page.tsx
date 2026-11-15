import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@fintech/database";
import {
  listStaff,
  inviteStaff,
  resendStaffInvite,
  setStaffStatus,
  setClientStatus,
  listClientsForConsole,
  getClientAssistance,
  openAssistance,
  setAssistanceGuidance,
  recordAssistanceAction,
  endAssistance,
  listConsoleLog,
  ConsoleError,
  GUIDANCE_KEYS,
} from "@fintech/auth";
import { fulfillDocumentRequest } from "@fintech/documents";
import { Card, StatusPill } from "@fintech/ui";
import { getCurrentUser } from "../../../lib/session";

/**
 * Console super admin (demande produit 2026-11-14, maquette SODIVA) : équipe,
 * comptes clients et assistance en direct avec le code donné par le client.
 */

const MAX_FILE_BYTES = 10 * 1024 * 1024;

async function requireSuperAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") redirect("/");
  return user;
}

async function run(fn: () => Promise<unknown>, back: string, done: string) {
  try {
    await fn();
  } catch (error) {
    if (error instanceof ConsoleError) redirect(`${back}&error=${error.message}`);
    throw error;
  }
  revalidatePath("/console");
  redirect(`${back}&done=${done}`);
}

async function inviteAction(formData: FormData) {
  "use server";
  const actor = await requireSuperAdmin();
  await run(
    () =>
      inviteStaff(
        actor,
        { name: String(formData.get("name") ?? ""), email: String(formData.get("email") ?? ""), role: String(formData.get("role") ?? "") },
        process.env.ADMIN_URL ?? "http://localhost:3101"
      ),
    "/console?tab=team",
    "invited"
  );
}

async function resendInviteAction(formData: FormData) {
  "use server";
  const actor = await requireSuperAdmin();
  await run(() => resendStaffInvite(actor, String(formData.get("userId")), process.env.ADMIN_URL ?? "http://localhost:3101"), "/console?tab=team", "invite_resent");
}

async function staffStatusAction(formData: FormData) {
  "use server";
  const actor = await requireSuperAdmin();
  const status = formData.get("status") === "ACTIVE" ? "ACTIVE" : "SUSPENDED";
  await run(() => setStaffStatus(actor, String(formData.get("userId")), status), "/console?tab=team", status === "ACTIVE" ? "reactivated" : "suspended");
}

async function clientStatusAction(formData: FormData) {
  "use server";
  const actor = await requireSuperAdmin();
  const status = formData.get("status") === "ACTIVE" ? "ACTIVE" : "SUSPENDED";
  await run(() => setClientStatus(actor, String(formData.get("userId")), status), "/console?tab=clients", status === "ACTIVE" ? "reactivated" : "suspended");
}

async function openSessionAction(formData: FormData) {
  "use server";
  const actor = await requireSuperAdmin();
  const clientId = String(formData.get("clientId"));
  await run(() => openAssistance(actor, clientId, String(formData.get("code") ?? "")), `/console?tab=help&client=${clientId}`, "session_opened");
}

async function guideAction(formData: FormData) {
  "use server";
  const actor = await requireSuperAdmin();
  const clientId = String(formData.get("clientId"));
  await run(() => setAssistanceGuidance(actor, clientId, String(formData.get("key"))), `/console?tab=help&client=${clientId}`, "guided");
}

async function uploadForClientAction(formData: FormData) {
  "use server";
  const actor = await requireSuperAdmin();
  const clientId = String(formData.get("clientId"));
  const back = `/console?tab=help&client=${clientId}`;
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0 || file.size > MAX_FILE_BYTES) redirect(`${back}&error=file`);
  const request = await prisma.documentRequest.findFirst({ where: { id: String(formData.get("requestId")), targetUserId: clientId, status: "PENDING" } });
  if (!request) redirect(`${back}&error=not_found`);
  await run(
    async () => {
      // La session d'assistance (accord du client) est vérifiée AVANT le dépôt.
      await recordAssistanceAction(actor, clientId, "document", request.label);
      await fulfillDocumentRequest({
        requestId: request.id,
        ownerId: clientId,
        fileName: file.name.replace(/[^\w.\-]+/g, "_").slice(-80) || "document.pdf",
        content: Buffer.from(await file.arrayBuffer()),
      });
    },
    back,
    "uploaded"
  );
}

async function endSessionAction(formData: FormData) {
  "use server";
  const actor = await requireSuperAdmin();
  const clientId = String(formData.get("clientId"));
  await run(() => endAssistance(actor, clientId), `/console?tab=help&client=${clientId}`, "session_ended");
}

const inputClass = "w-full min-w-0 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink";
const btnPrimary = "rounded-lg bg-yellow px-3.5 py-2 text-sm font-semibold text-white hover:bg-yellow-ink";
const btnGhost = "rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:border-brand";
const btnDanger = "rounded-lg border border-accent/40 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent-soft";

export default async function ConsolePage({
  searchParams,
}: {
  searchParams: { tab?: string; client?: string; q?: string; done?: string; error?: string };
}) {
  const me = await requireSuperAdmin();
  const t = await getTranslations("ConsolePage");
  const locale = await getLocale();
  const dt = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const time = new Intl.DateTimeFormat(locale, { timeStyle: "short" });
  const tab = ["team", "clients", "help"].includes(searchParams.tab ?? "") ? searchParams.tab! : "help";

  const [staff, clients, log] = await Promise.all([
    tab === "team" ? listStaff() : Promise.resolve([]),
    tab !== "team" ? listClientsForConsole(searchParams.q) : Promise.resolve([]),
    listConsoleLog(25),
  ]);

  const targetIds = [...new Set(log.map((l) => l.entity.replace("User:", "")))];
  const targets = await prisma.user.findMany({ where: { id: { in: targetIds } }, select: { id: true, name: true, email: true } });
  const targetName = (entity: string) => {
    const u = targets.find((x) => `User:${x.id}` === entity);
    return u ? u.name ?? u.email : null;
  };

  const selected = tab === "help" && searchParams.client ? clients.find((c) => c.id === searchParams.client) ?? null : null;
  const assistance = selected ? await getClientAssistance(selected.id) : null;
  const mySession = assistance?.state === "active" && assistance.staffId === me.id;
  const pendingRequests = mySession
    ? await prisma.documentRequest.findMany({ where: { targetUserId: selected!.id, status: "PENDING" }, orderBy: { createdAt: "asc" } })
    : [];

  const statusPill = (s: string) =>
    s === "ACTIVE" ? <StatusPill tone="ok">{t("status.ACTIVE")}</StatusPill> : <StatusPill tone="risk">{t(`status.${s}` as "status.SUSPENDED")}</StatusPill>;
  const knownDone = ["invited", "invite_resent", "suspended", "reactivated", "session_opened", "guided", "uploaded", "session_ended"];
  const knownErrors = ["not_allowed", "invalid_input", "email_taken", "self", "last_super_admin", "not_found", "no_code", "bad_code", "too_many_attempts", "no_session", "file"];

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("kicker")}</p>
      <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-ink-soft">{t("description")}</p>

      <div className="mt-5 inline-flex flex-wrap gap-1 rounded-lg bg-surface-alt p-1">
        {(["help", "clients", "team"] as const).map((k) => (
          <a key={k} href={`/console?tab=${k}`} className={`rounded-md px-4 py-1.5 text-sm font-semibold ${tab === k ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"}`}>
            {t(`tabs.${k}`)}
          </a>
        ))}
      </div>

      {searchParams.done && knownDone.includes(searchParams.done) && (
        <p role="status" className="mt-4 rounded-lg bg-success-soft px-3 py-2 text-sm text-success">{t(`done.${searchParams.done}`)}</p>
      )}
      {searchParams.error && knownErrors.includes(searchParams.error) && (
        <p role="alert" className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">{t(`errors.${searchParams.error}`)}</p>
      )}

      {/* ------------------------------------------------------------ Équipe */}
      {tab === "team" && (
        <div className="mt-6 grid gap-5">
          <Card>
            <p className="font-display text-base font-semibold text-ink">{t("team.inviteTitle")}</p>
            <form action={inviteAction} className="mt-3 grid items-end gap-3 sm:grid-cols-[1fr_1fr_180px_auto]">
              <label className="grid gap-1 text-xs font-semibold text-ink-soft">
                {t("team.name")}
                <input name="name" required minLength={2} maxLength={80} className={inputClass} />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-ink-soft">
                {t("team.email")}
                <input name="email" type="email" required className={inputClass} />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-ink-soft">
                {t("team.role")}
                <select name="role" defaultValue="ADMIN" className={inputClass}>
                  {(["AGENT", "ADMIN", "SUPER_ADMIN"] as const).map((r) => (
                    <option key={r} value={r}>{t(`roles.${r}`)}</option>
                  ))}
                </select>
              </label>
              <button className={btnPrimary}>{t("team.invite")}</button>
            </form>
            <p className="mt-2 text-xs text-ink-faint">{t("team.inviteNote")}</p>
          </Card>

          <Card>
            <p className="font-display text-base font-semibold text-ink">{t("team.listTitle")}</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-ink-faint">
                  <tr>
                    <th className="py-2 pr-3">{t("team.colName")}</th>
                    <th className="py-2 pr-3">{t("team.colRole")}</th>
                    <th className="py-2 pr-3">{t("team.colRights")}</th>
                    <th className="py-2 pr-3">{t("team.colLogin")}</th>
                    <th className="py-2 pr-3">{t("team.colStatus")}</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s.id} className="border-t border-line align-top">
                      <td className="py-2.5 pr-3">
                        <span className="font-semibold text-ink">{s.name ?? s.email}</span>
                        <span className="block text-xs text-ink-faint">{s.email}</span>
                      </td>
                      <td className="py-2.5 pr-3 text-ink">{t(`roles.${s.role}` as "roles.ADMIN")}</td>
                      <td className="py-2.5 pr-3 text-xs text-ink-soft">{t(`rights.${s.role}` as "rights.ADMIN")}</td>
                      <td className="py-2.5 pr-3 text-xs text-ink-faint">
                        {s.invitationPending ? t("team.invitationPending") : s.lastLoginAt ? dt.format(s.lastLoginAt) : "—"}
                      </td>
                      <td className="py-2.5 pr-3">{statusPill(s.accountStatus)}</td>
                      <td className="whitespace-nowrap py-2.5 text-right">
                        {s.id === me.id ? (
                          <span className="text-xs text-ink-faint">{t("team.you")}</span>
                        ) : (
                          <span className="inline-flex gap-2">
                            {s.invitationPending && s.accountStatus === "ACTIVE" && (
                              <form action={resendInviteAction}>
                                <input type="hidden" name="userId" value={s.id} />
                                <button className={btnGhost}>{t("team.resend")}</button>
                              </form>
                            )}
                            <form action={staffStatusAction}>
                              <input type="hidden" name="userId" value={s.id} />
                              <input type="hidden" name="status" value={s.accountStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED"} />
                              <button className={s.accountStatus === "SUSPENDED" ? btnGhost : btnDanger}>
                                {s.accountStatus === "SUSPENDED" ? t("reactivate") : t("suspend")}
                              </button>
                            </form>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-ink-faint">{t("team.suspendNote")}</p>
          </Card>
        </div>
      )}

      {/* ------------------------------------------------------------ Clients */}
      {tab === "clients" && (
        <Card className="mt-6">
          <form action="/console" className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="tab" value="clients" />
            <input name="q" defaultValue={searchParams.q ?? ""} placeholder={t("searchPlaceholder")} className={`${inputClass} max-w-xs`} />
          </form>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-ink-faint">
                <tr>
                  <th className="py-2 pr-3">{t("clients.colClient")}</th>
                  <th className="py-2 pr-3">{t("clients.colCase")}</th>
                  <th className="py-2 pr-3">{t("clients.colAccount")}</th>
                  <th className="py-2 pr-3">{t("clients.colBlock")}</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => {
                  const app = c.applications[0];
                  const help = c.assistanceAsClient[0];
                  return (
                    <tr key={c.id} className="border-t border-line align-top">
                      <td className="py-2.5 pr-3">
                        <a href={`/comptes/${c.id}`} className="font-semibold text-ink hover:underline">{c.name ?? c.email}</a>
                        <span className="block text-xs text-ink-faint">{c.email}{c.phone ? ` · ${c.phone}` : ""}</span>
                      </td>
                      <td className="py-2.5 pr-3 text-xs text-ink-soft">{app ? `${app.reference} · ${t(`appStatus.${app.status}` as "appStatus.SUBMITTED")}` : "—"}</td>
                      <td className="py-2.5 pr-3">{statusPill(c.accountStatus)}</td>
                      <td className={`py-2.5 pr-3 text-xs ${help?.problem && !help.endedAt ? "text-accent" : "text-ink-faint"}`}>
                        {help?.problem && !help.endedAt ? help.problem : "—"}
                      </td>
                      <td className="whitespace-nowrap py-2.5 text-right">
                        <span className="inline-flex gap-2">
                          <a href={`/console?tab=help&client=${c.id}`} className={btnPrimary.replace("px-3.5 py-2", "px-3 py-1.5 text-xs")}>
                            {t("clients.assist")}
                          </a>
                          <form action={clientStatusAction}>
                            <input type="hidden" name="userId" value={c.id} />
                            <input type="hidden" name="status" value={c.accountStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED"} />
                            <button className={c.accountStatus === "SUSPENDED" ? btnGhost : btnDanger}>
                              {c.accountStatus === "SUSPENDED" ? t("reactivate") : t("suspend")}
                            </button>
                          </form>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* --------------------------------------------------------- Assistance */}
      {tab === "help" && (
        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          <Card>
            <form action="/console" className="flex gap-2">
              <input type="hidden" name="tab" value="help" />
              <input name="q" defaultValue={searchParams.q ?? ""} placeholder={t("searchPlaceholder")} className={inputClass} />
            </form>
            <ul className="mt-3 grid max-h-[480px] gap-1 overflow-y-auto">
              {clients.map((c) => {
                const help = c.assistanceAsClient[0];
                const asking = help && !help.endedAt;
                return (
                  <li key={c.id}>
                    <a
                      href={`/console?tab=help&client=${c.id}`}
                      className={`block rounded-lg border px-3 py-2 text-sm ${c.id === selected?.id ? "border-brand bg-brand-soft" : "border-transparent hover:bg-surface-alt"}`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate font-semibold text-ink">{c.name ?? c.email}</span>
                        {asking && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-label={t("help.asking")} />}
                      </span>
                      <span className="block truncate text-xs text-ink-faint">{c.email}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </Card>

          {!selected ? (
            <Card>
              <p className="text-sm text-ink-soft">{t("help.pick")}</p>
            </Card>
          ) : (
            <Card accented>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-ink-faint">{t("help.kicker")}</p>
                  <p className="font-display text-lg text-ink">{selected.name ?? selected.email}</p>
                  <p className="text-xs text-ink-faint">{selected.email}</p>
                </div>
                {mySession ? (
                  <StatusPill tone="ok">{t("help.activeUntil", { time: time.format(assistance!.expiresAt!) })}</StatusPill>
                ) : assistance?.state === "active" ? (
                  <StatusPill tone="pending">{t("help.busy", { name: assistance.staff?.name ?? assistance.staff?.email ?? "" })}</StatusPill>
                ) : (
                  <StatusPill tone="pending">{assistance?.state === "pending" ? t("help.codeWaiting") : t("help.noCode")}</StatusPill>
                )}
              </div>
              <p className="mt-3 text-sm text-ink-soft">
                {t("help.problem")} <span className="font-semibold text-ink">{assistance?.problem ?? selected.assistanceAsClient[0]?.problem ?? t("help.noProblem")}</span>
              </p>

              {!mySession && assistance?.state !== "active" && (
                <div className="mt-4 rounded-xl bg-surface-alt p-4">
                  <p className="text-sm text-ink-soft">{t("help.codeExplain")}</p>
                  <form action={openSessionAction} className="mt-3 flex flex-wrap items-end gap-3">
                    <input type="hidden" name="clientId" value={selected.id} />
                    <label className="grid gap-1 text-xs font-semibold text-ink-soft">
                      {t("help.codeLabel")}
                      <input
                        name="code"
                        required
                        inputMode="numeric"
                        autoComplete="off"
                        pattern="\d{3}\s?\d{3}"
                        placeholder="000 000"
                        className="w-40 rounded-lg border border-line bg-white px-3 py-2 text-lg tracking-[0.25em] text-ink"
                      />
                    </label>
                    <button className={btnPrimary}>{t("help.open")}</button>
                  </form>
                </div>
              )}

              {mySession && (
                <div className="mt-5 grid gap-5">
                  <div>
                    <p className="text-sm font-semibold text-ink">{t("help.doTitle")}</p>
                    {pendingRequests.length === 0 ? (
                      <p className="mt-2 rounded-lg bg-surface-alt px-3 py-2 text-sm text-ink-soft">{t("help.noPendingDocs")}</p>
                    ) : (
                      <ul className="mt-2 grid gap-2">
                        {pendingRequests.map((r) => (
                          <li key={r.id} className="rounded-lg bg-surface-alt p-3">
                            <p className="text-sm font-semibold text-ink">{t("help.uploadFor", { label: r.label })}</p>
                            <p className="text-xs text-ink-faint">{t("help.uploadHint")}</p>
                            <form action={uploadForClientAction} className="mt-2 flex flex-wrap items-center gap-2">
                              <input type="hidden" name="clientId" value={selected.id} />
                              <input type="hidden" name="requestId" value={r.id} />
                              <input type="file" name="file" required accept=".pdf,.jpg,.jpeg,.png" className="text-xs" />
                              <button className={btnGhost}>{t("help.upload")}</button>
                            </form>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-2 text-xs text-ink-faint">
                      {t("help.moreActions")}{" "}
                      <a href={`/comptes/${selected.id}`} className="font-semibold underline">{t("help.openAccount")}</a>
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-ink">{t("help.guideTitle")}</p>
                    <p className="text-xs text-ink-faint">{t("help.guideExplain")}</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {GUIDANCE_KEYS.map((k) => (
                        <form key={k} action={guideAction}>
                          <input type="hidden" name="clientId" value={selected.id} />
                          <input type="hidden" name="key" value={k} />
                          <button
                            className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${assistance?.guidance === k ? "border-brand bg-brand-soft" : "border-line hover:border-brand"}`}
                          >
                            <span className="font-semibold text-ink">{t(`guidance.${k}.title`)}</span>
                            <span className="block text-xs text-ink-faint">{t(`guidance.${k}.why`)}</span>
                          </button>
                        </form>
                      ))}
                    </div>
                  </div>

                  <form action={endSessionAction}>
                    <input type="hidden" name="clientId" value={selected.id} />
                    <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">{t("help.end")}</button>
                  </form>
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------ Journal */}
      <Card className="mt-6">
        <p className="font-display text-base font-semibold text-ink">{t("log.title")}</p>
        {log.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">{t("log.empty")}</p>
        ) : (
          <ul className="mt-2 grid gap-1">
            {log.map((l) => (
              <li key={l.id} className="text-xs text-ink-soft">
                <span className="font-semibold text-ink">{t.has(`log.actions.${l.action.replace("console.", "")}`) ? t(`log.actions.${l.action.replace("console.", "")}` as "log.title") : l.action}</span>
                {targetName(l.entity) && <span className="text-ink"> — {targetName(l.entity)}</span>}
                {" · "}
                {t("log.by", { name: l.user?.name ?? l.user?.email ?? "—" })}
                {" · "}
                {dt.format(l.createdAt)}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-ink-faint">{t("log.note")}</p>
      </Card>
    </div>
  );
}
