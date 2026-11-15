import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { SiteHeader } from "./components/SiteHeader";
import { PageViewTracker } from "./components/PageViewTracker";

export const metadata: Metadata = {
  title: "SODIVA CREDITS · Courtier en crédit",
  description: "Courtier en crédit et financement participatif : nous comparons les offres, montons votre dossier et vous accompagnons jusqu'au versement des fonds.",
};

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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
