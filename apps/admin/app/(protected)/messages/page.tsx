import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma, notificationsRepo } from "@fintech/database";
import { sendClientNoticeEmail } from "@fintech/auth";
import { requestDocument } from "@fintech/documents";
import { listFundingCases, requestBrokerFee, DisbursementError } from "@fintech/applications";
import { Card, StatusPill } from "@fintech/ui";
import { getCurrentUser } from "../../../lib/session";

/**
 * « Demandes et messages » (demande produit 2026-11-14, maquette SODIVA) :
 * un admin ou super admin choisit un client puis lui demande un document,
 * un paiement (seulement après versement confirmé) ou lui écrit un message.
 * Chaque envoi apparaît dans les notifications du client (et dans « Messages »
 * pour un message), et déclenche un e-mail l'invitant à ouvrir son espace.
 */

const STAFF_ROLES = ["ADMIN", "SUPER_ADMIN"];
const DOC_TYPES = ["tax", "address", "payslips", "statements", "quote", "identity", "sale", "other"] as const;
const DELAYS: Record<string, number> = { "48h": 2, "7d": 7, "15d": 15 };
const TEMPLATES = ["progress", "granted", "appointment"] as const;
const LOCALES = ["fr", "en", "es", "it", "hu", "pt", "de", "nl"];

async function requireStaff() {
  const user = await getCurrentUser();
  if (!user || !STAFF_ROLES.includes(user.role)) redirect("/");
  return user;
}

async function loadClient(id: string) {
  const client = await prisma.user.findFirst({
    where: { id, role: { in: ["BORROWER", "INVESTOR"] } },
    select: { id: true, email: true, name: true, role: true, preferredLocale: true, accountStatus: true },
  });
  if (!client) redirect("/messages?error=client");
  return client;
}

function back(clientId: string, tab: string, param: string) {
  return `/messages?client=${clientId}&tab=${tab}&${param}`;
}

async function sendDocumentAction(formData: FormData) {
  "use server";
  const staff = await requireStaff();
  const client = await loadClient(formData.get("clientId") as string);
  const types = formData.getAll("types").map(String).filter((k) => (DOC_TYPES as readonly string[]).includes(k));
  const otherLabel = String(formData.get("otherLabel") ?? "").trim().slice(0, 120);
  const instructions = String(formData.get("instructions") ?? "").trim().slice(0, 1000);
  const days = DELAYS[String(formData.get("delay"))] ?? 7;
  if (types.length === 0 || (types.includes("other") && otherLabel.length < 2)) {
    redirect(back(client.id, "doc", "error=doc_missing"));
  }

  // Le libellé est enregistré dans la langue du client : c'est lui qui le lit.
  const clientLocale = LOCALES.includes(client.preferredLocale ?? "") ? client.preferredLocale! : "fr";
  const tClient = await getTranslations({ locale: clientLocale, namespace: "ClientRequestsPage.docTypes" });
  const dueAt = new Date(Date.now() + days * 86400000);
  for (const type of types) {
    await requestDocument({
      targetUserId: client.id,
      requestedById: staff.id,
      label: type === "other" ? otherLabel : tClient(type),
      instructions: instructions || undefined,
      dueAt,
    });
  }
  await sendClientNoticeEmail(client, "document", staff.name ?? staff.email);
  revalidatePath("/messages");
  redirect(back(client.id, "doc", "done=doc"));
}

async function sendPaymentAction(formData: FormData) {
  "use server";
  const staff = await requireStaff();
  const client = await loadClient(formData.get("clientId") as string);
  const applicationId = formData.get("applicationId") as string;
  const application = await prisma.application.findFirst({ where: { id: applicationId, borrowerId: client.id } });
  if (!application) redirect(back(client.id, "pay", "error=fees_locked"));
  try {
    await requestBrokerFee(staff, {
      applicationId,
      kind: formData.get("kind") as string,
      amount: Number(String(formData.get("amount")).replace(",", ".")),
      dueDate: new Date(formData.get("dueDate") as string),
    });
  } catch (error) {
    if (error instanceof DisbursementError) redirect(back(client.id, "pay", `error=${error.message === "fees_locked" ? "fees_locked" : "invalid"}`));
    throw error;
  }
  await sendClientNoticeEmail(client, "payment", staff.name ?? staff.email);
  revalidatePath("/messages");
  redirect(back(client.id, "pay", "done=pay"));
}

async function sendMessageAction(formData: FormData) {
  "use server";
  const staff = await requireStaff();
  const client = await loadClient(formData.get("clientId") as string);
  const subject = String(formData.get("subject") ?? "").trim().slice(0, 150);
  const body = String(formData.get("body") ?? "").trim().slice(0, 5000);
  if (subject.length < 2 || body.length < 2) redirect(back(client.id, "msg", "error=msg_missing"));

  await notificationsRepo.create({
    userId: client.id,
    event: "advisor.message",
    kind: "message",
    title: subject,
    body,
    link: "/messages",
    senderId: staff.id,
  });
  // E-mail systématique (demande produit) : « un message vous attend dans votre espace ».
  await sendClientNoticeEmail(client, "message", staff.name ?? staff.email);
  revalidatePath("/messages");
  redirect(back(client.id, "msg", "done=msg"));
}

const inputClass = "w-full min-w-0 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink";
const labelClass = "grid min-w-0 gap-1 text-xs font-semibold text-ink-soft";

export default async function ClientRequestsPage({
  searchParams,
}: {
  searchParams: { client?: string; tab?: string; q?: string; tpl?: string; done?: string; error?: string };
}) {
  await requireStaff();
  const t = await getTranslations("ClientRequestsPage");
  const locale = await getLocale();
  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });

  const q = (searchParams.q ?? "").trim();
  const clients = await prisma.user.findMany({
    where: {
      role: { in: ["BORROWER", "INVESTOR"] },
      accountStatus: "ACTIVE",
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {}),
    },
    select: { id: true, name: true, email: true, role: true },
    orderBy: [{ name: "asc" }, { email: "asc" }],
    take: 60,
  });

  const selected = searchParams.client
    ? await prisma.user.findFirst({
        where: { id: searchParams.client, role: { in: ["BORROWER", "INVESTOR"] } },
        select: { id: true, name: true, email: true, role: true, accountStatus: true },
      })
    : null;
  const tab = ["doc", "pay", "msg"].includes(searchParams.tab ?? "") ? searchParams.tab! : "msg";
  const tpl = (TEMPLATES as readonly string[]).includes(searchParams.tpl ?? "") ? searchParams.tpl! : null;

  const payableCases = selected
    ? (await listFundingCases()).filter((c) => c.borrower.id === selected.id && c.disbursement?.status === "CONFIRMED")
    : [];
  const otherCases = selected
    ? await prisma.application.findMany({
        where: { borrowerId: selected.id, NOT: { id: { in: payableCases.map((c) => c.id) } } },
        select: { reference: true, amount: true, status: true },
      })
    : [];

  // Historique des envois, avec le statut de l'objet lié (pièce reçue, paiement réglé).
  const history = await notificationsRepo.listSent({ userId: selected?.id, take: 30 });
  const docIds = history.filter((h) => h.kind === "document" && h.refId).map((h) => h.refId!);
  const feeIds = history.filter((h) => h.kind === "payment" && h.refId).map((h) => h.refId!);
  const [docs, fees] = await Promise.all([
    prisma.documentRequest.findMany({ where: { id: { in: docIds } }, select: { id: true, status: true } }),
    prisma.brokerFeeRequest.findMany({ where: { id: { in: feeIds } }, select: { id: true, status: true, amount: true, kind: true } }),
  ]);
  const statusOf = (h: (typeof history)[number]): { label: string; tone: "ok" | "pending" | "risk" } => {
    if (h.kind === "document") {
      const d = docs.find((x) => x.id === h.refId);
      if (d?.status === "FULFILLED") return { label: t("historyStatus.received"), tone: "ok" };
      if (d?.status === "CANCELLED") return { label: t("historyStatus.cancelled"), tone: "risk" };
    }
    if (h.kind === "payment") {
      const f = fees.find((x) => x.id === h.refId);
      if (f?.status === "PAID") return { label: t("historyStatus.paid"), tone: "ok" };
      if (f?.status === "CANCELLED") return { label: t("historyStatus.cancelled"), tone: "risk" };
    }
    return h.readAt ? { label: t("historyStatus.read"), tone: "ok" } : { label: t("historyStatus.unread"), tone: "pending" };
  };
  const subjectOf = (h: (typeof history)[number]) => {
    if (h.kind === "payment") {
      const f = fees.find((x) => x.id === h.refId);
      return f ? `${t(`feeKind.${f.kind}`)} · ${Number(f.amount).toLocaleString(locale)}` : t("tabs.pay");
    }
    return h.title ?? "—";
  };

  const tabHref = (k: string) => `/messages?client=${selected?.id}&tab=${k}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
  const today = new Date().toISOString().slice(0, 10);
  const inThirtyDays = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const knownDone = ["doc", "pay", "msg"];
  const knownErrors = ["doc_missing", "fees_locked", "invalid", "msg_missing", "client"];

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("kicker")}</p>
      <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-ink-soft">{t("description")}</p>

      {searchParams.done && knownDone.includes(searchParams.done) && (
        <p role="status" className="mt-4 rounded-lg bg-success-soft px-3 py-2 text-sm text-success">
          {t(`done.${searchParams.done}`, { name: selected?.name ?? selected?.email ?? "" })}
        </p>
      )}
      {searchParams.error && knownErrors.includes(searchParams.error) && (
        <p role="alert" className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">
          {t(`errors.${searchParams.error}`)}
        </p>
      )}

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[280px_1fr]">
        {/* --- Liste des clients --- */}
        <Card>
          <form className="flex gap-2" action="/messages">
            {selected && <input type="hidden" name="client" value={selected.id} />}
            <input type="hidden" name="tab" value={tab} />
            <input name="q" defaultValue={q} placeholder={t("searchPlaceholder")} className={inputClass} />
          </form>
          <p className="mt-3 px-1 text-xs font-semibold text-ink-faint">{t("clientsCount", { count: clients.length })}</p>
          <ul className="mt-2 grid max-h-[520px] gap-1 overflow-y-auto">
            {clients.map((c) => {
              const on = c.id === selected?.id;
              return (
                <li key={c.id}>
                  <a
                    href={`/messages?client=${c.id}&tab=${tab}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                    className={`block rounded-lg border px-3 py-2 text-sm ${on ? "border-brand bg-brand-soft" : "border-transparent hover:bg-surface-alt"}`}
                  >
                    <span className="block truncate font-semibold text-ink">{c.name ?? c.email}</span>
                    <span className="block truncate text-xs text-ink-faint">
                      {c.role === "INVESTOR" ? t("roleInvestor") : t("roleBorrower")} · {c.email}
                    </span>
                  </a>
                </li>
              );
            })}
            {clients.length === 0 && <li className="px-1 text-sm text-ink-soft">{t("noClients")}</li>}
          </ul>
        </Card>

        {/* --- Composition --- */}
        <div className="grid min-w-0 gap-5">
          {!selected ? (
            <Card>
              <p className="text-sm text-ink-soft">{t("pickClient")}</p>
            </Card>
          ) : (
            <Card accented>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-ink-faint">{t("recipient")}</p>
                  <p className="font-display text-lg text-ink">{selected.name ?? selected.email}</p>
                  <p className="text-xs text-ink-faint">{selected.email}</p>
                </div>
                <div className="flex flex-wrap gap-1 rounded-lg bg-surface-alt p-1">
                  {(["doc", "pay", "msg"] as const).map((k) => (
                    <a
                      key={k}
                      href={tabHref(k)}
                      className={`rounded-md px-3 py-1.5 text-sm font-semibold ${tab === k ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"}`}
                    >
                      {t(`tabs.${k}`)}
                    </a>
                  ))}
                </div>
              </div>

              {tab === "doc" && (
                <form action={sendDocumentAction} className="mt-5 grid gap-4">
                  <input type="hidden" name="clientId" value={selected.id} />
                  <fieldset>
                    <legend className="text-xs font-semibold text-ink-soft">{t("docTypesLabel")}</legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {DOC_TYPES.map((k) => (
                        <label key={k} className="flex cursor-pointer items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-ink has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
                          <input type="checkbox" name="types" value={k} className="accent-[#1f3fd1]" />
                          {t(`docTypes.${k}`)}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <label className={labelClass}>
                    {t("otherLabel")}
                    <input name="otherLabel" maxLength={120} className={inputClass} placeholder={t("otherPlaceholder")} />
                  </label>
                  <fieldset>
                    <legend className="text-xs font-semibold text-ink-soft">{t("delayLabel")}</legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.keys(DELAYS).map((k) => (
                        <label key={k} className="flex cursor-pointer items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-ink has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
                          <input type="radio" name="delay" value={k} defaultChecked={k === "7d"} className="accent-[#1f3fd1]" />
                          {t(`delays.${k}`)}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <label className={labelClass}>
                    {t("instructionsLabel")}
                    <textarea name="instructions" rows={2} maxLength={1000} className={inputClass} placeholder={t("instructionsPlaceholder")} />
                  </label>
                  <SendRow label={t("sendDoc")} note={t("channelsNote")} />
                </form>
              )}

              {tab === "pay" && (
                <div className="mt-5">
                  {payableCases.length === 0 ? (
                    <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">
                      {t("payBlocked")}{" "}
                      <a href="/versements" className="font-semibold underline">{t("payBlockedLink")}</a>
                    </p>
                  ) : (
                    <form action={sendPaymentAction} className="grid gap-4">
                      <input type="hidden" name="clientId" value={selected.id} />
                      <fieldset>
                        <legend className="text-xs font-semibold text-ink-soft">{t("loanLabel")}</legend>
                        <div className="mt-2 grid gap-2">
                          {payableCases.map((c, i) => (
                            <label key={c.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-line px-3 py-2 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
                              <input type="radio" name="applicationId" value={c.id} defaultChecked={i === 0} className="accent-[#1f3fd1]" />
                              <span>
                                <span className="font-semibold text-ink">{c.reference}</span>
                                <span className="text-ink-faint"> · {Number(c.offers[0]?.amount ?? c.amount).toLocaleString(locale)} {c.currency.code} · {t("fundsConfirmed")}</span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <label className={labelClass}>
                          {t("feeKindLabel")}
                          <select name="kind" className={inputClass} defaultValue="BROKER_FEE">
                            <option value="BROKER_FEE">{t("feeKind.BROKER_FEE")}</option>
                            <option value="COMPLEMENT">{t("feeKind.COMPLEMENT")}</option>
                          </select>
                        </label>
                        <label className={labelClass}>
                          {t("amountLabel")}
                          <input type="number" name="amount" required min={1} max={100000} step="0.01" className={inputClass} />
                        </label>
                        <label className={labelClass}>
                          {t("dueLabel")}
                          <input type="date" name="dueDate" required min={today} defaultValue={inThirtyDays} className={inputClass} />
                        </label>
                      </div>
                      <p className="rounded-lg bg-surface-alt px-3 py-2 text-xs text-ink-soft">{t("payNote")}</p>
                      <SendRow label={t("sendPay")} note={t("channelsNote")} />
                    </form>
                  )}
                  {otherCases.length > 0 && (
                    <p className="mt-3 text-xs text-ink-faint">
                      {t("otherCases", { list: otherCases.map((c) => c.reference).join(", ") })}
                    </p>
                  )}
                </div>
              )}

              {tab === "msg" && (
                <form action={sendMessageAction} className="mt-5 grid gap-4">
                  <input type="hidden" name="clientId" value={selected.id} />
                  <div>
                    <p className="text-xs font-semibold text-ink-soft">{t("templatesLabel")}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {TEMPLATES.map((k) => (
                        <a
                          key={k}
                          href={`${tabHref("msg")}&tpl=${k}`}
                          className={`rounded-full border px-3 py-1.5 text-sm ${tpl === k ? "border-brand bg-brand-soft text-ink" : "border-line text-ink-soft hover:text-ink"}`}
                        >
                          {t(`templates.${k}.label`)}
                        </a>
                      ))}
                    </div>
                  </div>
                  <label className={labelClass}>
                    {t("subjectLabel")}
                    <input
                      key={`s-${tpl}`}
                      name="subject"
                      required
                      minLength={2}
                      maxLength={150}
                      defaultValue={tpl ? t(`templates.${tpl}.subject`) : ""}
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    {t("bodyLabel")}
                    <textarea
                      key={`b-${tpl}`}
                      name="body"
                      required
                      minLength={2}
                      maxLength={5000}
                      rows={6}
                      defaultValue={tpl ? t(`templates.${tpl}.body`, { name: selected.name?.split(" ")[0] ?? "" }) : ""}
                      className={inputClass}
                    />
                  </label>
                  <SendRow label={t("sendMsg")} note={t("channelsNote")} />
                </form>
              )}
            </Card>
          )}

          {/* --- Historique --- */}
          <Card>
            <p className="font-display text-base font-semibold text-ink">
              {selected ? t("historyFor", { name: selected.name ?? selected.email }) : t("historyAll")}
            </p>
            {history.length === 0 ? (
              <p className="mt-2 text-sm text-ink-soft">{t("historyEmpty")}</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-ink-faint">
                    <tr>
                      <th className="py-2 pr-3 font-semibold">{t("historyCols.date")}</th>
                      {!selected && <th className="py-2 pr-3 font-semibold">{t("historyCols.client")}</th>}
                      <th className="py-2 pr-3 font-semibold">{t("historyCols.type")}</th>
                      <th className="py-2 pr-3 font-semibold">{t("historyCols.subject")}</th>
                      <th className="py-2 pr-3 font-semibold">{t("historyCols.by")}</th>
                      <th className="py-2 font-semibold">{t("historyCols.status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => {
                      const st = statusOf(h);
                      return (
                        <tr key={h.id} className="border-t border-line align-top">
                          <td className="whitespace-nowrap py-2 pr-3 text-ink-faint">{dateFmt.format(h.createdAt)}</td>
                          {!selected && (
                            <td className="py-2 pr-3">
                              <a href={`/messages?client=${h.user.id}`} className="font-semibold text-ink hover:underline">
                                {h.user.name ?? h.user.email}
                              </a>
                            </td>
                          )}
                          <td className="py-2 pr-3 text-ink-soft">{t(`kind.${h.kind}`)}</td>
                          <td className="py-2 pr-3 text-ink">{subjectOf(h)}</td>
                          <td className="py-2 pr-3 text-ink-faint">{h.sender?.name ?? h.sender?.email ?? "—"}</td>
                          <td className="py-2">
                            <StatusPill tone={st.tone}>{st.label}</StatusPill>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function SendRow({ label, note }: { label: string; note: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
      <p className="max-w-md text-xs text-ink-faint">{note}</p>
      <button className="rounded-lg bg-yellow px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-ink">{label}</button>
    </div>
  );
}
