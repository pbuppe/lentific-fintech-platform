const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@fintech/ui",
    "@fintech/database",
    "@fintech/auth",
    "@fintech/users",
    "@fintech/applications",
    "@fintech/funding",
    "@fintech/kyc",
    "@fintech/loans",
    "@fintech/contracts",
    "@fintech/signatures",
    "@fintech/notifications",
    "@fintech/documents",
    "@fintech/risk",
    "@fintech/investors",
    "@fintech/payments",
  ],
  experimental: {
    // Le monorepo pnpm a des packages en dehors de apps/admin, nécessaire pour
    // que Next.js résolve correctement les workspaces (§ arborescence).
    externalDir: true,
    // Sans ça, sur Vercel, le traçage des fichiers du bundle serverless ne
    // remonte pas jusqu'à la racine du monorepo : le moteur Prisma (binaire
    // natif, hors de apps/admin) n'est alors pas inclus dans le déploiement
    // et chaque requête à la base échoue avec "Query Engine ... not found".
    outputFileTracingRoot: path.join(__dirname, "../../"),
    // outputFileTracingRoot dit où chercher, mais le traceur ne suit pas les
    // fichiers binaires natifs (le moteur Prisma) par simple analyse des
    // imports : il faut lister explicitement leur chemin pour qu'ils soient
    // copiés dans le paquet de chaque fonction serverless.
    outputFileTracingIncludes: {
      "/**/*": ["../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/**"],
    },
    // Active apps/admin/instrumentation.ts (même rôle que côté web, §ci-dessous) :
    // apps/web et apps/admin sont deux processus Node séparés, chacun a besoin de
    // charger tous les modules qui réagissent aux événements pour que les actions
    // faites depuis le back-office (confirmer un KYC, une signature...) déclenchent
    // bien toute la chaîne en cascade, pas seulement dans le processus web.
    instrumentationHook: true,
  },
};

module.exports = nextConfig;
