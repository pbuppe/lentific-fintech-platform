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
    // Active apps/web/instrumentation.ts, qui enregistre les handlers d'événements
    // (kyc, loans, contracts...) au démarrage du serveur.
    instrumentationHook: true,
  },
};

module.exports = nextConfig;
