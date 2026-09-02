import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "./components/SiteHeader";

export const metadata: Metadata = {
  title: "Lentific · Financement participatif P2P",
  description: "Le financement se répartit en confiance, pas au hasard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
