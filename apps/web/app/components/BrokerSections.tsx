import { getTranslations } from "next-intl/server";
import { submitContactRequestAction } from "../../lib/actions/contact";
import { ScrollToHere } from "./ScrollToHere";

/**
 * Sections « courtier » du site vitrine (demande produit 2026-11-14, maquette
 * Lentific) : services, le cabinet, questions fréquentes, demande d'étude
 * gratuite et pied de page avec les mentions légales.
 */

const SERVICE_KEYS = ["mortgage", "consolidation", "works", "crowd"] as const;
const SERVICE_ICON: Record<(typeof SERVICE_KEYS)[number], string> = { mortgage: "⌂", consolidation: "≡", works: "✦", crowd: "◎" };
const FAQ_KEYS = ["cost", "individuals", "documents", "delay", "remote"] as const;

export async function ServicesSection() {
  const t = await getTranslations("HomeBroker.services");
  return (
    <section id="services" className="scroll-mt-6 px-6 py-16 sm:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("eyebrow")}</p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">{t("title")}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_KEYS.map((k) => (
            <a
              key={k}
              href={k === "crowd" ? "/marketplace" : "#contact"}
              className="group rounded-2xl border border-line bg-surface p-5 transition hover:border-brand hover:shadow-sm"
            >
              <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-lg text-brand-ink">
                {SERVICE_ICON[k]}
              </span>
              <h3 className="mt-4 font-display text-lg text-ink">{t(`${k}.title`)}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{t(`${k}.body`)}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-brand-ink group-hover:underline">{t(`${k}.cta`)} →</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export async function AboutSection() {
  const t = await getTranslations("HomeBroker.about");
  const points = ["independent", "single", "remote", "noFees"] as const;
  return (
    <section className="bg-surface-alt px-6 py-16 sm:px-12">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("eyebrow")}</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">{t("title")}</h2>
          <p className="mt-3 text-ink-soft">{t("text")}</p>
        </div>
        <ul className="grid gap-3">
          {points.map((k) => (
            <li key={k} className="flex items-start gap-3 rounded-xl bg-surface p-4">
              <span aria-hidden className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">✓</span>
              <span className="text-sm text-ink">{t(`points.${k}`)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export async function FaqSection() {
  const t = await getTranslations("HomeBroker.faq");
  return (
    <section id="faq" className="scroll-mt-6 px-6 py-16 sm:px-12">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("eyebrow")}</p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">{t("title")}</h2>
        <div className="mt-6 grid gap-2">
          {FAQ_KEYS.map((k) => (
            <details key={k} className="group rounded-xl border border-line bg-surface px-5 py-4 open:shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-display text-base font-semibold text-ink">
                {t(`${k}.q`)}
                <span aria-hidden className="text-xl text-brand transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t(`${k}.a`)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

const field = "w-full min-w-0 rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink";
const label = "grid min-w-0 gap-1 text-xs font-semibold text-ink-soft";

export async function ContactSection({ status }: { status?: string }) {
  const t = await getTranslations("HomeBroker.contact");
  return (
    <section id="contact" className="scroll-mt-6 bg-gradient-to-b from-brand to-brand-ink px-6 py-16 text-white sm:px-12">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-white/70">{t("eyebrow")}</p>
          <h2 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">{t("title")}</h2>
          <p className="mt-3 text-white/80">{t("sub")}</p>
          <ul className="mt-6 grid gap-2 text-sm text-white/85">
            <li>✓ {t("free")}</li>
            <li>✓ {t("noCommitment")}</li>
            <li>✓ {t("answer")}</li>
          </ul>
        </div>
        <div className="rounded-2xl bg-white p-6 text-ink shadow-xl">
          {status && <ScrollToHere />}
          {status === "ok" ? (
            <div role="status" className="py-6 text-center">
              <p className="font-display text-xl font-semibold text-brand">{t("thanksTitle")}</p>
              <p className="mt-2 text-sm text-ink-soft">{t("thanksBody")}</p>
            </div>
          ) : (
            <form action={submitContactRequestAction} className="grid gap-3" data-track="Demande d’étude gratuite (formulaire de contact)">
              {status === "invalid" && (
                <p role="alert" className="rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">{t("invalid")}</p>
              )}
              {/* Champ piège pour les robots, invisible pour les personnes. */}
              <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
                <label>
                  Website
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <label className={label}>
                {t("name")}
                <input name="name" required minLength={2} maxLength={100} autoComplete="name" className={field} />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={label}>
                  {t("phone")}
                  <input name="phone" required type="tel" autoComplete="tel" className={field} />
                </label>
                <label className={label}>
                  {t("email")}
                  <input name="email" required type="email" autoComplete="email" className={field} />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={label}>
                  {t("project")}
                  <select name="project" required defaultValue="MORTGAGE" className={field}>
                    {(["MORTGAGE", "CONSOLIDATION", "WORKS", "OTHER"] as const).map((p) => (
                      <option key={p} value={p}>{t(`projects.${p}`)}</option>
                    ))}
                  </select>
                </label>
                <label className={label}>
                  {t("amount")}
                  <input name="amount" inputMode="numeric" placeholder={t("amountPlaceholder")} className={field} />
                </label>
              </div>
              <label className={label}>
                {t("message")}
                <textarea name="message" rows={3} maxLength={1500} className={field} />
              </label>
              <label className="flex items-start gap-2 text-xs text-ink-soft">
                <input type="checkbox" name="consent" required className="mt-0.5 accent-brand" />
                <span>{t("consent")}</span>
              </label>
              <button className="rounded-lg bg-yellow px-4 py-2.5 text-sm font-semibold text-ink hover:bg-yellow-ink">{t("send")}</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Pied de page avec mentions légales. Les informations réglementaires (ORIAS,
 * médiateur, coordonnées) viennent de la configuration (.env) et ne sont
 * affichées que si elles sont renseignées : rien n'est inventé.
 */
export async function SiteFooter() {
  const t = await getTranslations("HomeBroker.footer");
  const legal = {
    company: process.env.SITE_COMPANY_NAME,
    orias: process.env.SITE_ORIAS_NUMBER,
    address: process.env.SITE_ADDRESS,
    phone: process.env.SITE_PHONE,
    email: process.env.SITE_CONTACT_EMAIL,
    mediator: process.env.SITE_MEDIATOR,
    manager: process.env.SITE_MANAGER,
  };
  return (
    <footer className="border-t border-line bg-surface px-6 py-10 text-sm text-ink-soft sm:px-12">
      <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
        <div>
          <p className="font-sans text-sm font-bold uppercase tracking-wide text-ink">{legal.company ?? "Lentific"}</p>
          {legal.address && <p className="mt-2">{legal.address}</p>}
          {legal.phone && (
            <p>
              {t("phone")} <a href={`tel:${legal.phone.replace(/[^\d+]/g, "")}`} className="hover:text-ink">{legal.phone}</a>
            </p>
          )}
          {legal.email && (
            <p>
              <a href={`mailto:${legal.email}`} className="hover:text-ink">{legal.email}</a>
            </p>
          )}
          {legal.manager && <p className="mt-2">{t("contactPerson", { name: legal.manager })}</p>}
        </div>
        <div className="grid content-start gap-1.5">
          <a href="#services" className="hover:text-ink">{t("services")}</a>
          <a href="/simulateur" className="hover:text-ink">{t("simulator")}</a>
          <a href="/marketplace" className="hover:text-ink">{t("marketplace")}</a>
          <a href="#faq" className="hover:text-ink">{t("faq")}</a>
          <a href="/login" className="hover:text-ink">{t("login")}</a>
        </div>
        <div className="text-xs leading-relaxed text-ink-faint">
          {legal.orias && <p>{t("orias", { number: legal.orias })}</p>}
          {legal.mediator && <p className="mt-1">{t("mediator", { name: legal.mediator })}</p>}
          <p className="mt-2">{t("creditWarning")}</p>
          <p className="mt-2">{t("noFeeBefore")}</p>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-5xl text-xs text-ink-faint">{t("copyright", { year: new Date().getFullYear(), company: legal.company ?? "Lentific" })}</p>
    </footer>
  );
}
