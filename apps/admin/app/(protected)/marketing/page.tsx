import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma, auditLogsRepo } from "@fintech/database";
import {
  ACCOUNT_REVIEWER_ROLES,
  MARKETING_LOCALES,
  MARKETING_TEMPLATE_KEYS,
  MARKETING_TEMPLATE_PATHS,
  addMarketingContacts,
  contactInbox,
  countCampaignPending,
  isMarketingLocale,
  marketingDailyLimit,
  marketingSentLast24h,
  marketingTemplate,
  renderMarketingEmail,
  sendCampaignBatch,
  sendCampaignTest,
  type MarketingBasis,
} from "@fintech/auth";
import { Card, StatusPill } from "@fintech/ui";
import { getCurrentUser } from "../../../lib/session";

/**
 * E-mailing marketing (demande produit 2026-11-15) : modèles prêts à l'emploi,
 * contacts de prospection et campagnes, réservés aux admins et super admins.
 * Logique d'envoi, modèles et garde-fous : packages/auth/src/marketing.ts.
 */

const BASES: MarketingBasis[] = ["CONSENT", "PROFESSIONAL", "CLIENT"];
const input = "rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink";
const primary = "rounded-lg bg-yellow px-4 py-2 text-sm font-semibold text-ink hover:bg-yellow-ink";
const secondary = "rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-alt";

async function requireMarketer() {
  const user = await getCurrentUser();
  if (!user || !ACCOUNT_REVIEWER_ROLES.includes(user.role)) redirect("/");
  return user;
}

const LANG_NAMES: Record<string, string> = { fr: "Français", en: "English", es: "Español", it: "Italiano", hu: "Magyar", pt: "Português", de: "Deutsch", nl: "Nederlands" };

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

async function saveCampaignAction(formData: FormData) {
  "use server";
  const user = await requireMarketer();
  const id = String(formData.get("id") ?? "");
  const locale = String(formData.get("locale") ?? "fr");
  const templateKey = String(formData.get("templateKey") ?? "") || null;
  const subject = String(formData.get("subject") ?? "").trim().slice(0, 200);
  const body = String(formData.get("body") ?? "").trim().slice(0, 8000);
  const ctaLabel = String(formData.get("ctaLabel") ?? "").trim().slice(0, 80) || null;
  const ctaUrl = String(formData.get("ctaUrl") ?? "").trim().slice(0, 500) || null;
  if (!isMarketingLocale(locale) || subject.length < 3 || body.length < 10 || (ctaUrl && !/^(\/|https?:\/\/)/i.test(ctaUrl))) {
    redirect("/marketing?tab=campaigns&error=invalid#editor");
  }
  if (id) {
    const existing = await prisma.marketingCampaign.findUnique({ where: { id } });
    if (!existing || existing.sentCount > 0) redirect("/marketing?tab=campaigns&error=locked");
    await prisma.marketingCampaign.update({ where: { id }, data: { subject, body, ctaLabel, ctaUrl } });
  } else {
    const created = await prisma.marketingCampaign.create({ data: { locale, templateKey, subject, body, ctaLabel, ctaUrl, createdById: user.id } });
    await auditLogsRepo.create({ userId: user.id, action: "marketing.campaign_created", entity: `MarketingCampaign:${created.id}`, after: { subject, locale } });
  }
  revalidatePath("/marketing");
  redirect("/marketing?tab=campaigns&done=saved");
}

async function testCampaignAction(formData: FormData) {
  "use server";
  const user = await requireMarketer();
  const id = String(formData.get("id"));
  const result = await sendCampaignTest(id, user.email);
  redirect(`/marketing?tab=campaigns&done=${result.status === "FAILED" ? "testFailed" : "testSent"}#c-${id}`);
}

async function sendCampaignAction(formData: FormData) {
  "use server";
  const user = await requireMarketer();
  const id = String(formData.get("id"));
  if (formData.get("confirm") !== "on") redirect(`/marketing?tab=campaigns&error=confirm#c-${id}`);
  const r = await sendCampaignBatch(id);
  await auditLogsRepo.create({ userId: user.id, action: "marketing.batch_sent", entity: `MarketingCampaign:${id}`, after: { sent: r.sent, local: r.local, failed: r.failed, remaining: r.remaining } });
  revalidatePath("/marketing");
  const code = r.failed ? "batchFailed" : r.limited ? "batchLimited" : "batchSent";
  redirect(`/marketing?tab=campaigns&done=${code}&n=${r.sent + r.local}&left=${r.remaining}#c-${id}`);
}

async function deleteCampaignAction(formData: FormData) {
  "use server";
  await requireMarketer();
  const id = String(formData.get("id"));
  const c = await prisma.marketingCampaign.findUnique({ where: { id } });
  if (c && c.sentCount === 0) await prisma.marketingCampaign.delete({ where: { id } });
  revalidatePath("/marketing");
  redirect("/marketing?tab=campaigns&done=deleted");
}

async function addContactsAction(formData: FormData) {
  "use server";
  const user = await requireMarketer();
  const basis = String(formData.get("basis") ?? "") as MarketingBasis;
  if (!BASES.includes(basis) || formData.get("certify") !== "on") redirect("/marketing?tab=contacts&error=basis");
  const r = await addMarketingContacts({
    raw: String(formData.get("raw") ?? ""),
    basis,
    defaultLocale: String(formData.get("locale") ?? "fr"),
    addedById: user.id,
  });
  await auditLogsRepo.create({ userId: user.id, action: "marketing.contacts_added", entity: "MarketingContact", after: { ...r, basis } });
  revalidatePath("/marketing");
  redirect(`/marketing?tab=contacts&done=added&a=${r.added}&s=${r.skipped}&i=${r.invalid}`);
}

async function contactStatusAction(formData: FormData) {
  "use server";
  await requireMarketer();
  const id = String(formData.get("id"));
  const op = String(formData.get("op"));
  if (op === "delete") await prisma.marketingContact.delete({ where: { id } }).catch(() => null);
  if (op === "unsubscribe") await prisma.marketingContact.update({ where: { id }, data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date() } }).catch(() => null);
  revalidatePath("/marketing");
  redirect("/marketing?tab=contacts&done=contactUpdated");
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type Search = { tab?: string; tpl?: string; lang?: string; edit?: string; done?: string; error?: string; n?: string; left?: string; a?: string; s?: string; i?: string; preview?: string };

export default async function MarketingPage({ searchParams }: { searchParams: Search }) {
  const user = await requireMarketer();
  const t = await getTranslations("MarketingPage");
  const uiLocale = await getLocale();
  const dt = new Intl.DateTimeFormat(uiLocale, { dateStyle: "medium", timeStyle: "short" });
  const tab = searchParams.tab === "contacts" ? "contacts" : searchParams.tab === "templates" ? "templates" : "campaigns";
  const lang = isMarketingLocale(searchParams.lang) ? searchParams.lang : isMarketingLocale(uiLocale) ? uiLocale : "fr";

  const providerLive = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
  const [sent24h, byLocale, totals] = await Promise.all([
    marketingSentLast24h(),
    prisma.marketingContact.groupBy({ by: ["locale"], where: { status: "SUBSCRIBED" }, _count: true }),
    prisma.marketingContact.groupBy({ by: ["status"], _count: true }),
  ]);
  const subscribed = totals.find((x) => x.status === "SUBSCRIBED")?._count ?? 0;
  const unsubscribed = totals.find((x) => x.status === "UNSUBSCRIBED")?._count ?? 0;
  const limit = marketingDailyLimit();

  const flash = (() => {
    const d = searchParams.done;
    if (d === "saved") return t("flash.saved");
    if (d === "deleted") return t("flash.deleted");
    if (d === "testSent") return t("flash.testSent", { email: user.email });
    if (d === "testFailed") return t("flash.testFailed");
    if (d === "batchSent") return t("flash.batchSent", { n: Number(searchParams.n ?? 0), left: Number(searchParams.left ?? 0) });
    if (d === "batchLimited") return t("flash.batchLimited", { n: Number(searchParams.n ?? 0), left: Number(searchParams.left ?? 0) });
    if (d === "batchFailed") return t("flash.batchFailed");
    if (d === "added") return t("flash.added", { a: Number(searchParams.a ?? 0), s: Number(searchParams.s ?? 0), i: Number(searchParams.i ?? 0) });
    if (d === "contactUpdated") return t("flash.contactUpdated");
    return null;
  })();
  const error = searchParams.error ? t(`errors.${searchParams.error}` as "errors.invalid") : null;

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("kicker")}</p>
      <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-ink-soft">{t("description", { inbox: contactInbox() })}</p>

      <div className="mt-5 flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-surface-alt px-3 py-1 text-ink-soft">{t("stats.subscribed")} : <span className="font-semibold text-ink">{subscribed}</span></span>
        <span className="rounded-full bg-surface-alt px-3 py-1 text-ink-soft">{t("stats.unsubscribed")} : <span className="font-semibold text-ink">{unsubscribed}</span></span>
        <span className="rounded-full bg-surface-alt px-3 py-1 text-ink-soft">{t("stats.today", { sent: sent24h, limit })}</span>
        {!providerLive && <StatusPill tone="pending">{t("stats.localMode")}</StatusPill>}
      </div>

      <div className="mt-5 inline-flex gap-1 rounded-lg bg-surface-alt p-1">
        {(["campaigns", "templates", "contacts"] as const).map((k) => (
          <a key={k} href={`/marketing?tab=${k}`} className={`rounded-md px-3 py-1.5 text-sm font-semibold ${tab === k ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"}`}>
            {t(`tabs.${k}`)}
          </a>
        ))}
      </div>

      {flash && <p role="status" className="mt-4 rounded-lg bg-success-soft px-3 py-2 text-sm text-success">{flash}</p>}
      {error && <p role="alert" className="mt-4 rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">{error}</p>}

      {tab === "templates" && <TemplatesTab lang={lang} t={t} />}
      {tab === "contacts" && <ContactsTab t={t} dt={dt} byLocale={byLocale.map((b) => ({ locale: b.locale, count: b._count }))} lang={lang} />}
      {tab === "campaigns" && <CampaignsTab t={t} dt={dt} searchParams={searchParams} lang={lang} byLocale={byLocale.map((b) => ({ locale: b.locale, count: b._count }))} />}
    </div>
  );
}

type T = Awaited<ReturnType<typeof getTranslations>>;

function LangPicker({ base, lang, t }: { base: string; lang: string; t: T }) {
  return (
    <div className="flex flex-wrap items-center gap-1 text-xs">
      <span className="mr-1 font-semibold text-ink-soft">{t("language")} :</span>
      {MARKETING_LOCALES.map((l) => (
        <a key={l} href={`${base}&lang=${l}`} className={`rounded-md px-2 py-1 font-semibold ${l === lang ? "bg-brand text-white" : "bg-surface-alt text-ink-soft hover:text-ink"}`}>
          {l.toUpperCase()}
        </a>
      ))}
    </div>
  );
}

function TemplatesTab({ lang, t }: { lang: string; t: T }) {
  return (
    <div className="mt-6 grid gap-4">
      <p className="text-sm text-ink-soft">{t("templates.intro")}</p>
      <LangPicker base="/marketing?tab=templates" lang={lang} t={t} />
      {MARKETING_TEMPLATE_KEYS.map((key) => {
        const tpl = marketingTemplate(key, lang)!;
        const r = renderMarketingEmail({ ...tpl, ctaUrl: MARKETING_TEMPLATE_PATHS[key], locale: lang }, { name: "Camille Martin", unsubscribeToken: "apercu" });
        return (
          <Card key={key}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-display text-base text-ink">{t(`templates.names.${key}` as "templates.names.discover")}</p>
                <p className="text-xs text-ink-faint">{t(`templates.uses.${key}` as "templates.uses.discover")}</p>
                <p className="mt-2 text-sm font-semibold text-ink">{tpl.subject}</p>
              </div>
              <a href={`/marketing?tab=campaigns&tpl=${key}&lang=${lang}#editor`} className={primary}>{t("templates.use")}</a>
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-semibold text-brand">{t("templates.preview")}</summary>
              <iframe title={tpl.subject} srcDoc={`<base target="_blank">${r.html}`} sandbox="allow-popups allow-popups-to-escape-sandbox" className="mt-3 h-[520px] w-full rounded-lg border border-line bg-white" />
            </details>
          </Card>
        );
      })}
    </div>
  );
}

async function CampaignsTab({ t, dt, searchParams, lang, byLocale }: { t: T; dt: Intl.DateTimeFormat; searchParams: Search; lang: string; byLocale: { locale: string; count: number }[] }) {
  const campaigns = await prisma.marketingCampaign.findMany({ orderBy: { createdAt: "desc" }, take: 30 });
  const pending = await Promise.all(campaigns.map((c) => countCampaignPending(c.id, c.locale)));
  const editing = searchParams.edit ? campaigns.find((c) => c.id === searchParams.edit && c.sentCount === 0) : undefined;
  const tplKey = searchParams.tpl && (MARKETING_TEMPLATE_KEYS as readonly string[]).includes(searchParams.tpl) ? searchParams.tpl : null;
  const tpl = tplKey ? marketingTemplate(tplKey, lang) : null;
  const draft = editing
    ? { subject: editing.subject, body: editing.body, ctaLabel: editing.ctaLabel ?? "", ctaUrl: editing.ctaUrl ?? "", locale: editing.locale, templateKey: editing.templateKey ?? "" }
    : { subject: tpl?.subject ?? "", body: tpl?.body ?? "", ctaLabel: tpl?.ctaLabel ?? "", ctaUrl: tplKey ? MARKETING_TEMPLATE_PATHS[tplKey as keyof typeof MARKETING_TEMPLATE_PATHS] : "/", locale: lang, templateKey: tplKey ?? "" };
  const audience = byLocale.find((b) => b.locale === draft.locale)?.count ?? 0;

  return (
    <div className="mt-6 grid gap-5">
      <Card>
        <section id="editor" className="scroll-mt-6">
          <p className="font-display text-base text-ink">{editing ? t("editor.editTitle") : t("editor.newTitle")}</p>
          {!editing && (
            <div className="mt-3 grid gap-2">
              <LangPicker base={`/marketing?tab=campaigns${tplKey ? `&tpl=${tplKey}` : ""}`} lang={lang} t={t} />
              <div className="flex flex-wrap items-center gap-1 text-xs">
                <span className="mr-1 font-semibold text-ink-soft">{t("editor.startFrom")} :</span>
                {MARKETING_TEMPLATE_KEYS.map((k) => (
                  <a key={k} href={`/marketing?tab=campaigns&tpl=${k}&lang=${lang}#editor`} className={`rounded-md px-2 py-1 font-semibold ${k === tplKey ? "bg-brand text-white" : "bg-surface-alt text-ink-soft hover:text-ink"}`}>
                    {t(`templates.names.${k}` as "templates.names.discover")}
                  </a>
                ))}
              </div>
            </div>
          )}
          <p className="mt-3 text-xs text-ink-faint">{t("editor.audience", { lang: LANG_NAMES[draft.locale] ?? draft.locale, count: audience })}</p>
          <form action={saveCampaignAction} className="mt-3 grid gap-3" key={`${draft.locale}-${draft.templateKey}-${editing?.id ?? "new"}`}>
            <input type="hidden" name="id" value={editing?.id ?? ""} />
            <input type="hidden" name="locale" value={draft.locale} />
            <input type="hidden" name="templateKey" value={draft.templateKey} />
            <label className="grid gap-1 text-xs font-semibold text-ink-soft">
              {t("editor.subject")}
              <input name="subject" required minLength={3} maxLength={200} defaultValue={draft.subject} className={input} />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-ink-soft">
              {t("editor.body")}
              <textarea name="body" required minLength={10} maxLength={8000} rows={10} defaultValue={draft.body} className={input} />
              <span className="font-normal text-ink-faint">{t("editor.bodyHelp")}</span>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-semibold text-ink-soft">
                {t("editor.ctaLabel")}
                <input name="ctaLabel" maxLength={80} defaultValue={draft.ctaLabel} className={input} />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-ink-soft">
                {t("editor.ctaUrl")}
                <input name="ctaUrl" maxLength={500} defaultValue={draft.ctaUrl} className={input} placeholder="/" />
              </label>
            </div>
            <div className="flex gap-2">
              <button className={primary}>{t("editor.save")}</button>
              {editing && <a href="/marketing?tab=campaigns" className={secondary}>{t("editor.cancel")}</a>}
            </div>
          </form>
        </section>
      </Card>

      <p className="font-display text-base text-ink">{t("list.title")}</p>
      {campaigns.length === 0 ? (
        <Card><p className="text-sm text-ink-soft">{t("list.empty")}</p></Card>
      ) : (
        campaigns.map((c, i) => {
          const left = pending[i];
          const preview = renderMarketingEmail(c, { name: "Camille Martin", unsubscribeToken: "apercu" });
          return (
            <section key={c.id} id={`c-${c.id}`} className="scroll-mt-6">
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-base text-ink">{c.subject}</p>
                    <p className="text-xs text-ink-faint">
                      {LANG_NAMES[c.locale] ?? c.locale} · {dt.format(c.createdAt)}
                      {c.templateKey && ` · ${t(`templates.names.${c.templateKey}` as "templates.names.discover")}`}
                    </p>
                  </div>
                  <div className="text-right">
                    {c.status === "DRAFT" && <StatusPill tone="pending">{t("list.status.DRAFT")}</StatusPill>}
                    {c.status === "SENDING" && <StatusPill tone="pending">{t("list.status.SENDING")}</StatusPill>}
                    {c.status === "SENT" && <StatusPill tone="ok">{t("list.status.SENT")}</StatusPill>}
                    <p className="mt-1 text-xs text-ink-soft">{t("list.counts", { sent: c.sentCount, left })}</p>
                  </div>
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-semibold text-brand">{t("templates.preview")}</summary>
                  <iframe title={c.subject} srcDoc={`<base target="_blank">${preview.html}`} sandbox="allow-popups allow-popups-to-escape-sandbox" className="mt-3 h-[520px] w-full rounded-lg border border-line bg-white" />
                </details>
                <div className="mt-3 flex flex-wrap items-end gap-2">
                  <form action={testCampaignAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className={secondary}>{t("list.test")}</button>
                  </form>
                  {c.sentCount === 0 && (
                    <>
                      <a href={`/marketing?tab=campaigns&edit=${c.id}#editor`} className={secondary}>{t("list.edit")}</a>
                      <form action={deleteCampaignAction}>
                        <input type="hidden" name="id" value={c.id} />
                        <button className={secondary}>{t("list.delete")}</button>
                      </form>
                    </>
                  )}
                  {left > 0 && (
                    <form action={sendCampaignAction} className="flex flex-wrap items-center gap-2 rounded-lg bg-surface-alt px-3 py-2">
                      <input type="hidden" name="id" value={c.id} />
                      <label className="flex items-center gap-2 text-xs text-ink-soft">
                        <input type="checkbox" name="confirm" required />
                        {t("list.confirm", { count: Math.min(left, 50) })}
                      </label>
                      <button className={primary}>{c.sentCount > 0 ? t("list.sendNext") : t("list.send")}</button>
                    </form>
                  )}
                </div>
              </Card>
            </section>
          );
        })
      )}
    </div>
  );
}

async function ContactsTab({ t, dt, byLocale, lang }: { t: T; dt: Intl.DateTimeFormat; byLocale: { locale: string; count: number }[]; lang: string }) {
  const contacts = await prisma.marketingContact.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <div className="mt-6 grid gap-5">
      <Card>
        <p className="font-display text-base text-ink">{t("contacts.addTitle")}</p>
        <p className="mt-1 text-sm text-ink-soft">{t("contacts.addHelp")}</p>
        <form action={addContactsAction} className="mt-3 grid gap-3">
          <textarea name="raw" required rows={6} className={`${input} font-mono`} placeholder={"marie.dupont@example.com; Marie Dupont; fr\njohn@example.com; John Smith; en"} />
          <label className="grid gap-1 text-xs font-semibold text-ink-soft sm:max-w-xs">
            {t("contacts.defaultLanguage")}
            <select name="locale" defaultValue={lang} className={input}>
              {MARKETING_LOCALES.map((l) => <option key={l} value={l}>{LANG_NAMES[l]}</option>)}
            </select>
          </label>
          <fieldset className="grid gap-2">
            <legend className="text-xs font-semibold text-ink-soft">{t("contacts.basisLabel")}</legend>
            {BASES.map((b) => (
              <label key={b} className="flex items-start gap-2 text-sm text-ink">
                <input type="radio" name="basis" value={b} required className="mt-1" />
                <span>{t(`contacts.basis.${b}` as "contacts.basis.CONSENT")}</span>
              </label>
            ))}
          </fieldset>
          <label className="flex items-start gap-2 text-sm text-ink-soft">
            <input type="checkbox" name="certify" required className="mt-1" />
            <span>{t("contacts.certify")}</span>
          </label>
          <div><button className={primary}>{t("contacts.add")}</button></div>
        </form>
      </Card>

      <div className="flex flex-wrap gap-2 text-sm">
        {byLocale.map((b) => (
          <span key={b.locale} className="rounded-full bg-surface-alt px-3 py-1 text-ink-soft">{LANG_NAMES[b.locale] ?? b.locale} : <span className="font-semibold text-ink">{b.count}</span></span>
        ))}
      </div>

      <Card>
        {contacts.length === 0 ? (
          <p className="text-sm text-ink-soft">{t("contacts.empty")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-ink-faint">
                <tr>
                  <th className="py-2 pr-3">{t("contacts.colEmail")}</th>
                  <th className="py-2 pr-3">{t("contacts.colLanguage")}</th>
                  <th className="py-2 pr-3">{t("contacts.colBasis")}</th>
                  <th className="py-2 pr-3">{t("contacts.colStatus")}</th>
                  <th className="py-2 pr-3">{t("contacts.colAdded")}</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-t border-line align-top">
                    <td className="py-2 pr-3"><span className="text-ink">{c.email}</span>{c.name && <span className="block text-xs text-ink-faint">{c.name}</span>}</td>
                    <td className="py-2 pr-3 text-ink-soft">{c.locale.toUpperCase()}</td>
                    <td className="py-2 pr-3 text-xs text-ink-soft">{t(`contacts.basisShort.${c.basis}` as "contacts.basisShort.CONSENT")}</td>
                    <td className="py-2 pr-3">
                      {c.status === "SUBSCRIBED" ? <StatusPill tone="ok">{t("contacts.status.SUBSCRIBED")}</StatusPill> : <StatusPill tone="risk">{t(`contacts.status.${c.status}` as "contacts.status.UNSUBSCRIBED")}</StatusPill>}
                    </td>
                    <td className="py-2 pr-3 text-xs text-ink-faint">{dt.format(c.createdAt)}</td>
                    <td className="py-2">
                      <form action={contactStatusAction} className="flex gap-1">
                        <input type="hidden" name="id" value={c.id} />
                        {c.status === "SUBSCRIBED" && <button name="op" value="unsubscribe" className="text-xs font-semibold text-brand underline">{t("contacts.unsubscribe")}</button>}
                        <button name="op" value="delete" className="text-xs font-semibold text-accent underline">{t("contacts.delete")}</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
