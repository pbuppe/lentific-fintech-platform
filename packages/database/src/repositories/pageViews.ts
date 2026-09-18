import { prisma } from "../client";

export function record(data: { path: string; locale?: string; countryCode?: string; referrer?: string }) {
  return prisma.pageView.create({ data });
}

export function countSince(since: Date) {
  return prisma.pageView.count({ where: { createdAt: { gte: since } } });
}

/** Un point par jour sur les `days` derniers jours, jours sans visite inclus (à 0). */
export async function countByDay(days: number) {
  const since = new Date();
  since.setDate(since.getDate() - days + 1);
  since.setHours(0, 0, 0, 0);

  const rows = await prisma.$queryRaw<{ day: Date; count: bigint }[]>`
    SELECT date_trunc('day', "createdAt") as day, count(*) as count
    FROM "PageView"
    WHERE "createdAt" >= ${since}
    GROUP BY day
    ORDER BY day ASC
  `;
  const byDay = new Map(rows.map((r) => [r.day.toISOString().slice(0, 10), Number(r.count)]));

  return Array.from({ length: days }, (_, i) => {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    return { date: key, count: byDay.get(key) ?? 0 };
  });
}

export async function topPaths(since: Date, limit: number) {
  const rows = await prisma.$queryRaw<{ path: string; count: bigint }[]>`
    SELECT "path", count(*) as count
    FROM "PageView"
    WHERE "createdAt" >= ${since}
    GROUP BY "path"
    ORDER BY count DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({ path: r.path, count: Number(r.count) }));
}

export async function countByLocale(since: Date) {
  const rows = await prisma.$queryRaw<{ locale: string | null; count: bigint }[]>`
    SELECT "locale", count(*) as count
    FROM "PageView"
    WHERE "createdAt" >= ${since}
    GROUP BY "locale"
    ORDER BY count DESC
  `;
  return rows.map((r) => ({ locale: r.locale ?? "?", count: Number(r.count) }));
}

export async function countByCountry(since: Date) {
  const rows = await prisma.$queryRaw<{ countryCode: string | null; count: bigint }[]>`
    SELECT "countryCode", count(*) as count
    FROM "PageView"
    WHERE "createdAt" >= ${since}
    GROUP BY "countryCode"
    ORDER BY count DESC
  `;
  return rows.map((r) => ({ countryCode: r.countryCode ?? "?", count: Number(r.count) }));
}
