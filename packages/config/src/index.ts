/**
 * Variables d'environnement typées + constantes partagées (§ arborescence, packages/config).
 * Aucun autre package ne doit lire process.env directement, tout passe par ici,
 * pour qu'une variable manquante échoue tôt, avec un message clair.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name} (voir .env.example)`);
  }
  return value;
}

export const env = {
  databaseUrl: () => required("DATABASE_URL"),
  betterAuthSecret: () => required("BETTER_AUTH_SECRET"),
  betterAuthUrl: () => process.env.BETTER_AUTH_URL ?? "http://localhost:3000",

  stripeSecretKey: () => process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: () => process.env.STRIPE_WEBHOOK_SECRET ?? "",

  documentsBucket: () => process.env.DOCUMENTS_S3_BUCKET ?? "fintech-documents-dev",

  inngestEventKey: () => process.env.INNGEST_EVENT_KEY ?? "",

  appUrl: () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  adminUrl: () => process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001",
};

export const APP_NAME = "Lentific";

export const SUPPORTED_ROLES = ["BORROWER", "INVESTOR", "AGENT", "ADMIN", "SUPER_ADMIN"] as const;
