import { prisma } from "../client";
import { currencyForCountry } from "../countryCurrencies";

export function findByCode(code: string) {
  return prisma.country.findUnique({ where: { code } });
}

/**
 * Fiche Pays d'un nouvel inscrit, créée à la demande avec sa devise
 * (2026-11-16 : inscription ouverte à tous les pays proposés).
 */
export async function findOrCreateByCode(code: string, defaultLocale: string) {
  const upper = code.toUpperCase();
  const existing = await prisma.country.findUnique({ where: { code: upper } });
  if (existing) return existing;
  const currency = await prisma.currency.upsert({
    where: { code: currencyForCountry(upper) },
    update: {},
    create: { code: currencyForCountry(upper) },
  });
  return prisma.country.upsert({
    where: { code: upper },
    update: {},
    create: { code: upper, currencyId: currency.id, defaultLocale },
  });
}
