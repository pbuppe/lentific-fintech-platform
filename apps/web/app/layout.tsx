import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { SITE_URL } from "../lib/seo";
import "./globals.css";
import { SiteHeader } from "./components/SiteHeader";
import { PageViewTracker } from "./components/PageViewTracker";
import { CookieConsentBanner } from "./components/CookieConsent";

// Valeurs par défaut de toutes les pages (chaque page publique les précise, voir lib/seo.ts).
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Seo");
  return {
    metadataBase: new URL(SITE_URL),
    title: `${t("homeTitle")} | Lentific`,
    description: t("homeDescription"),
    applicationName: "Lentific",
    // Code de validation Google Search Console (variable Vercel), si renseigné.
    verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="font-sans">
        <NextIntlClientProvider messages={messages}>
          <PageViewTracker />
          <SiteHeader />
          {children}
          <CookieConsentBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
