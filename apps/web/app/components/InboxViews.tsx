import { getTranslations, getLocale } from "next-intl/server";
import { notificationsRepo } from "@fintech/database";
import { Card, Icon, type IconName } from "@fintech/ui";
import { openNotificationAction, markAllNotificationsReadAction } from "../../lib/actions/clientInbox";

type InboxUser = { id: string; role: string };

const KIND_STYLE: Record<string, { icon: IconName; className: string }> = {
  message: { icon: "message", className: "bg-brand-soft text-brand-ink" },
  document: { icon: "file", className: "bg-accent-soft text-accent" },
  payment: { icon: "card", className: "bg-sand text-sand-ink" },
  system: { icon: "bell", className: "bg-success-soft text-success" },
};

/** Centre de notifications : événements automatiques + envois de l'équipe. */
export async function NotificationsView({ user }: { user: InboxUser }) {
  const t = await getTranslations("ClientInbox");
  const locale = await getLocale();
  const fmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const EVENT_LABEL = t.raw("eventLabels") as Record<string, string>;
  const items = await notificationsRepo.listForUser(user.id);
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("kicker")}</p>
          <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
            {t("notificationsTitle")}
          </h1>
          <p className="mt-3 text-sm text-ink-soft">{t("unreadCount", { count: unread })}</p>
        </div>
        {unread > 0 && (
          <form action={markAllNotificationsReadAction}>
            <button className="rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-semibold text-ink hover:border-brand">
              {t("markAllRead")}
            </button>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <Card className="mt-6">
          <p className="text-sm text-ink-soft">{t("notificationsEmpty")}</p>
        </Card>
      ) : (
        <ul className="mt-6 grid gap-2">
          {items.map((n) => {
            const style = KIND_STYLE[n.kind ?? "system"] ?? KIND_STYLE.system;
            const eventLabel = EVENT_LABEL[n.event.replace(/\./g, "_")] ?? n.event;
            const title = n.kind === "message" ? n.title : n.kind === "document" ? t("documentRequested", { label: n.title ?? "" }) : eventLabel;
            const sub = n.kind === "message" ? t("messageFrom", { name: n.sender?.name ?? n.sender?.email ?? "" }) : n.body;
            return (
              <li key={n.id}>
                <form action={openNotificationAction}>
                  <input type="hidden" name="id" value={n.id} />
                  <button
                    className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition hover:border-brand ${
                      n.readAt ? "border-line bg-surface-alt" : "border-line bg-surface shadow-sm"
                    }`}
                  >
                    <span aria-hidden className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${style.className}`}>
                      <Icon name={style.icon} size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className={`text-sm ${n.readAt ? "text-ink-soft" : "font-semibold text-ink"}`}>{title}</span>
                        <span className="text-xs text-ink-faint">{fmt.format(n.createdAt)}</span>
                      </span>
                      {sub && <span className="mt-0.5 block truncate text-xs text-ink-faint">{sub}</span>}
                    </span>
                    {!n.readAt && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" aria-label={t("unread")} />}
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

/** Messages écrits par l'équipe (conseiller, admin). Ouvrir la page les marque comme lus. */
export async function MessagesView({ user }: { user: InboxUser }) {
  const t = await getTranslations("ClientInbox");
  const locale = await getLocale();
  const fmt = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short" });
  const messages = await notificationsRepo.listForUser(user.id, { kind: "message" });
  // Affichés d'abord avec leur état « non lu », puis marqués lus pour la suite
  // (l'équipe voit « Lu » dans son historique d'envois).
  if (messages.some((m) => !m.readAt)) await notificationsRepo.markAllRead(user.id, "message");

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("kicker")}</p>
      <h1 className="relative mt-1 inline-block font-display text-2xl font-semibold text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-[3px] after:w-9 after:rounded after:bg-accent">
        {t("messagesTitle")}
      </h1>
      <p className="mt-3 max-w-xl text-sm text-ink-soft">{t("messagesSubtitle")}</p>

      {messages.length === 0 ? (
        <Card className="mt-6">
          <p className="text-sm text-ink-soft">{t("messagesEmpty")}</p>
        </Card>
      ) : (
        <div className="mt-6 grid gap-3">
          {messages.map((m) => (
            <Card key={m.id} accented={!m.readAt}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft font-display text-sm font-bold text-brand-ink">
                    {(m.sender?.name ?? m.sender?.email ?? "?").slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{m.sender?.name ?? m.sender?.email ?? t("team")}</p>
                    <p className="text-xs text-ink-faint">{t("advisorRole")}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink-faint">{fmt.format(m.createdAt)}</p>
                  {!m.readAt && <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-accent">{t("new")}</p>}
                </div>
              </div>
              <h2 className="mt-4 font-display text-base font-semibold text-ink">{m.title}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{m.body}</p>
            </Card>
          ))}
        </div>
      )}
      <p className="mt-6 text-xs text-ink-faint">{t("safetyNote")}</p>
    </main>
  );
}
