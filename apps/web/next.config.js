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
    "@fintech/localization",
    "@fintech/kyc",
    "@fintech/loans",
    "@fintech/contracts",
    "@fintech/signatures",
    "@fintech/notifications",
    "@fintech/documents",
    "@fintech/risk",
    "@fintech/introductions",
    "@fintech/investors",
    "@fintech/payments",
    "@fintech/workflow",
  ],
  experimental: {
    // Le monorepo pnpm a des packages en dehors de apps/web, nécessaire pour que
    // Next.js résolve correctement les workspaces (§ arborescence).
    externalDir: true,
    // Sans ça, sur Vercel, le traçage des fichiers du bundle serverless ne
    // remonte pas jusqu'à la racine du monorepo : le moteur Prisma (binaire
    // natif, hors de apps/web) n'est alors pas inclus dans le déploiement et
    // chaque requête à la base échoue avec "Query Engine ... not found".
    outputFileTracingRoot: path.join(__dirname, "../../"),
    // Active apps/web/instrumentation.ts, qui enregistre les handlers d'événements
    // (kyc, loans, contracts...) au démarrage du serveur.
    instrumentationHook: true,
  },
};

module.exports = nextConfig;
