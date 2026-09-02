/**
 * packages/localization : langues, sous-domaines, devises, formats par pays
 * (§37, §38, §39). Le routage par sous-domaine est résolu dans le middleware
 * de apps/web (voir apps/web/middleware.ts) ; ce module est la source de vérité
 * pour la correspondance sous-domaine → locale.
 */
import { prisma } from "@fintech/database";

export async function resolveLocaleFromSubdomain(subdomain: string): Promise<string> {
  const language = await prisma.language.findUnique({ where: { subdomain } });
  return language?.code ?? "fr-FR";
}

export function formatCurrency(amount: number, currencyCode: string, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency: currencyCode }).format(amount);
}

export function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(date);
}
