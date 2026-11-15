import { getTranslations } from "next-intl/server";
import { subscriptionsRepo } from "@fintech/database";
import { getSignedInUser } from "../../lib/session";
import { commercialPrices } from "../../lib/price";
import { premiumPath } from "../../lib/premiumPath";

/** Visiteur, emprunteur ou investisseur connecté, et s'il est déjà abonné. */
async function viewer() {
  const user = await getSignedInUser();
  const signedIn = Boolean(user && user.accountStatus === "ACTIVE" && (user.role === "BORROWER" || user.role === "INVESTOR"));
  const sub = signedIn ? await subscriptionsRepo.findForUser(user!.id) : null;
  return {
    role: signedIn ? (user!.role as "BORROWER" | "INVESTOR") : null,
    isPremium: sub?.status === "ACTIVE",
  };
}

/** Lien vers l'offre : page Premium de l'espace si connecté, sinon section de l'accueil. */
export async function premiumHref() {
  const { role } = await viewer();
  return role ? premiumPath(role) : "/#premium";
}

/** Section « Abonnement Premium » de la page d'accueil. */
export async function PremiumHomeSection() {
  const t = await getTranslations("PremiumPromo");
  const { amount, fee } = await commercialPrices();
  const { role, isPremium } = await viewer();
  const borrowerHref = role === "BORROWER" ? "/premium" : role ? "/investor/premium" : "/signup?role=BORROWER";
  const investorHref = role === "INVESTOR" ? "/investor/premium" : role ? "/premium" : "/signup?role=INVESTOR";

  const card = (title: string, text: string, cta: string, href: string, highlight: boolean) => (
    <div className={`flex flex-col rounded-2xl p-6 ${highlight ? "bg-white text-ink shadow-xl" : "border border-white/20 bg-white/5 text-white"}`}>
      <p className={`font-display text-lg font-semibold ${highlight ? "text-brand" : ""}`}>{title}</p>
      <p className={`mt-2 flex-1 text-sm leading-relaxed ${highlight ? "text-ink-soft" : "text-white/85"}`}>{text}</p>
      <p className="mt-4">
        <span className={`font-display text-3xl font-semibold ${highlight ? "text-brand-ink" : ""}`}>{amount}</span>{" "}
        <span className={`text-sm ${highlight ? "text-ink-soft" : "text-white/80"}`}>{t("perMonth")}</span>
      </p>
      <p className={`text-xs ${highlight ? "text-ink-faint" : "text-white/70"}`}>{t("unlimited")}</p>
      {!isPremium && (
        <a
          href={href}
          className={`mt-4 rounded-lg px-4 py-2.5 text-center text-sm font-semibold ${highlight ? "bg-yellow text-ink hover:bg-yellow-ink" : "bg-bg text-brand-ink hover:bg-white"}`}
        >
          {role ? t("ctaPremium") : cta}
        </a>
      )}
    </div>
  );

  return (
    <section id="premium" className="scroll-mt-6 bg-brand px-6 py-16 text-white sm:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-widest text-white/70">{t("eyebrow")}</p>
        <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold leading-tight">{t("title")}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85">{t("text", { fee, amount })}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {card(t("borrowerTitle"), t("borrowerText"), t("ctaBorrower"), borrowerHref, role !== "INVESTOR")}
          {card(t("investorTitle"), t("investorText"), t("ctaInvestor"), investorHref, role === "INVESTOR")}
        </div>
        <p className="mt-5 text-sm font-semibold text-white">{t("breakEven")}</p>
        <p className="mt-2 text-xs text-white/65">{t("noGuarantee")}</p>
      </div>
    </section>
  );
}

/** Bandeau compact repris sur les pages clés ; masqué pour un abonné. */
export async function PremiumBanner({ className = "" }: { className?: string }) {
  const { role, isPremium } = await viewer();
  if (isPremium) return null;
  const t = await getTranslations("PremiumPromo");
  const { amount } = await commercialPrices();
  const text = role === "BORROWER" ? t("bannerBorrower", { amount }) : role === "INVESTOR" ? t("bannerInvestor", { amount }) : t("bannerVisitor", { amount });
  return (
    <aside className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/20 bg-brand-soft px-4 py-3 ${className}`}>
      <p className="min-w-0 flex-1 text-sm text-brand-ink">
        <span aria-hidden className="mr-1.5">★</span>
        {text}
      </p>
      <a href={role ? premiumPath(role) : "/#premium"} className="shrink-0 rounded-lg bg-brand px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-ink">
        {t("bannerCta")}
      </a>
    </aside>
  );
}
