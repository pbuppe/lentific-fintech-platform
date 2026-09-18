import type { MetadataRoute } from "next";

// Back-office interne : rien ici ne doit être indexé, à plus forte raison
// /admin-access/[token] (§ demande produit 2026-09-18, lien secret de
// création de compte admin).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
