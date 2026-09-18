import { prisma } from "../client";

export function record(data: { path: string; locale?: string; countryCode?: string; referrer?: string; visitorId?: string }) {
  return prisma.pageView.create({ data });
}

export function countSince(since: Date) {
  return prisma.pageView.count({ where: { createdAt: { gte: since } } });
}

/** Visiteurs distincts (cookie NEXT_VISITOR_ID) depuis `since`, pas des pages vues. */
export async function countUniqueVisitorsSince(since: Date) {
  const rows = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT count(DISTINCT "visitorId") as count
    FROM "PageView"
    WHERE "createdAt" >= ${since} AND "visitorId" IS NOT NULL
  `;
  return Number(rows[0]?.count ?? 0);
}

/**
 * "Actifs maintenant" (§ demande produit 2026-09-18 : "connectées depuis les
 * 30 dernières minutes") : visiteurs distincts ayant vu au moins une page
 * dans la fenêtre donnée, pas de vraie présence temps réel (pas de
 * websocket), recalculé à chaque chargement de la page Statistiques.
 */
export async function countActiveVisitors(minutesWindow: number) {
  const since = new Date(Date.now() - minutesWindow * 60 * 1000);
  return countUniqueVisitorsSince(since);
}

/** Un point par jour sur les `days` derniers jours (pages vues ET visiteurs uniques), jours sans visite inclus (à 0). */
export async function countByDay(days: number) {
  const since = new Date();
  since.setDate(since.getDate() - days + 1);
  since.setHours(0, 0, 0, 0);

  const rows = await prisma.$queryRaw<{ day: Date; views: bigint; visitors: bigint }[]>`
    SELECT date_trunc('day', "createdAt") as day, count(*) as views, count(DISTINCT "visitorId") as visitors
    FROM "PageView"
    WHERE "createdAt" >= ${since}
    GROUP BY day
    ORDER BY day ASC
  `;
  const byDay = new Map(rows.map((r) => [r.day.toISOString().slice(0, 10), { views: Number(r.views), visitors: Number(r.visitors) }]));

  return Array.from({ length: days }, (_, i) => {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const entry = byDay.get(key);
    return { date: key, views: entry?.views ?? 0, visitors: entry?.visitors ?? 0 };
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
