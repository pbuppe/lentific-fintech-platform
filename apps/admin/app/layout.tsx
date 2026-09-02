import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lentific · Back-office",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans">{children}</body>
    </html>
  );
}
