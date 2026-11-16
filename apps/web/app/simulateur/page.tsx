import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { pageMetadata } from "../../lib/seo";
import type { Locale } from "../../i18n/locales";
import { getTranslations } from "next-intl/server";
import { Simulator } from "./Simulator";
import { PremiumBanner } from "../components/PremiumPromo";

/** SEO (2026-11-16) : titre et description dans la langue du visiteur. */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Seo");
  const locale = (await getLocale()) as Locale;
  return pageMetadata({ locale, title: t("simulatorTitle"), description: t("simulatorDescription"), keywords: t("keywords"), path: "/simulateur" });
}

export default async function SimulateurPage() {
  const t = await getTranslations("SimulatorPage");
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 sm:px-12">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">{t("eyebrow")}</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">{t("title")}</h1>
      <PremiumBanner className="mt-4" />
      <p className="mt-2 max-w-xl text-ink-soft">
        {t("subtitle")}
      </p>
      <div className="mt-8">
        <Simulator />
      </div>
    </main>
  );
}
