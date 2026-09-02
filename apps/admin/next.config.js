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
    // Active apps/admin/instrumentation.ts (même rôle que côté web, §ci-dessous) :
    // apps/web et apps/admin sont deux processus Node séparés, chacun a besoin de
    // charger tous les modules qui réagissent aux événements pour que les actions
    // faites depuis le back-office (confirmer un KYC, une signature...) déclenchent
    // bien toute la chaîne en cascade, pas seulement dans le processus web.
    instrumentationHook: true,
  },
};

module.exports = nextConfig;
