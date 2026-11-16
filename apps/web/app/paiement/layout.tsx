import { NOINDEX } from "../../lib/seo";

// Pages privées ou techniques : jamais indexées par les moteurs de recherche (SEO, 2026-11-16).
export const metadata = NOINDEX;

export default function NoIndexLayout({ children }: { children: React.ReactNode }) {
  return children;
}
