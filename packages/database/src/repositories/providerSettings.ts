import { prisma } from "../client";

/** Réglages techniques créés automatiquement (ex. identifiant du plan PayPal Premium). */
export async function get(key: string) {
  return (await prisma.providerSetting.findUnique({ where: { key } }))?.value ?? null;
}

export function set(key: string, value: string) {
  return prisma.providerSetting.upsert({ where: { key }, create: { key, value }, update: { value } });
}
