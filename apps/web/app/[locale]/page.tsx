import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SUPPORTED_LOCALES, type Locale } from "../../i18n/locales";
import { pageMetadata } from "../../lib/seo";
import { LocaleCookieSetter } from "../components/LocaleCookieSetter";
import { LOCALE_TO_COUNTRY } from "../../i18n/countries";
import HomePage from "../page";

/**
 * Accueil par langue (/fr, /en, /de…), demande produit 2026-11-16 (SEO) :
 * le même contenu que « / », mais à une adresse fixe par langue que Google
 * peut indexer séparément. La langue est imposée par middleware.ts
 * (en-tête x-forced-locale), « / » reste la version par défaut (x-default).
 */
type Props = { params: { locale: string }; searchParams: { contact?: string } };

function isLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = await getTranslations({ locale: params.locale, namespace: "Seo" });
  return pageMetadata({
    locale: params.locale,
    title: t("homeTitle"),
    description: t("homeDescription"),
    keywords: t("keywords"),
    path: `/${params.locale}`,
    pathFor: (l) => `/${l}`,
    xDefault: "/",
  });
}

export default async function LocaleHomePage({ params, searchParams }: Props) {
  if (!isLocale(params.locale)) notFound();
  return (
    <>
      <LocaleCookieSetter locale={params.locale} country={LOCALE_TO_COUNTRY[params.locale]} />
      <HomePage searchParams={searchParams} />
    </>
  );
}
