import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/seo";

/** robots.txt : pages publiques ouvertes aux moteurs, espaces privés et techniques exclus. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/investor",
          "/documents",
          "/messages",
          "/notifications",
          "/paiements",
          "/premium",
          "/demande",
          "/onboarding",
          "/aide",
          "/mises-en-relation",
          "/investisseurs",
          "/paiement",
          "/desabonnement",
          "/login",
          "/signup",
          "/verifier-email",
          "/compte-en-attente",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
