import { prisma } from "../client";

export function record(data: {
  path: string;
  locale?: string;
  countryCode?: string;
  geoCountryCode?: string;
  referrer?: string;
  visitorId?: string;
}) {
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
 * "Actifs" (§ demande produit 2026-09-18) : visiteurs distincts ayant vu au
 * moins une page dans la fenêtre donnée. Pas de vraie présence temps réel
 * (pas de websocket), recalculé à chaque chargement de la page Statistiques
 * (voir AutoRefresh.tsx pour le rafraîchissement automatique).
 */
export async function countActiveVisitors(minutesWindow: number) {
  const since = new Date(Date.now() - minutesWindow * 60 * 1000);
  return countUniqueVisitorsSince(since);
}

export type StatsRange = "24h" | "7d" | "30d" | "1y";

export function rangeToSince(range: StatsRange): Date {
  const now = new Date();
  if (range === "24h") return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (range === "7d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 6);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (range === "30d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 29);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const d = new Date(now);
  d.setFullYear(d.getFullYear() - 1);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Série temporelle (pages vues + visiteurs uniques par intervalle), avec un
 * découpage adapté à la période choisie : par heure sur 24h, par jour sur
 * 7/30 jours, par mois sur 1 an, sinon un graphique sur un an aurait 365
 * barres illisibles (§ demande produit 2026-09-18 : filtre 24h/7j/1 an).
 * Intervalles sans visite inclus, à 0.
 */
export async function countTimeSeries(range: StatsRange) {
  const since = rangeToSince(range);
  const unit = range === "24h" ? "hour" : range === "1y" ? "month" : "day";

  const rows = await prisma.$queryRaw<{ bucket: Date; views: bigint; visitors: bigint }[]>`
    SELECT date_trunc(${unit}, "createdAt") as bucket, count(*) as views, count(DISTINCT "visitorId") as visitors
    FROM "PageView"
    WHERE "createdAt" >= ${since}
    GROUP BY bucket
    ORDER BY bucket ASC
  `;

  const keyOf = (d: Date) => (unit === "hour" ? d.toISOString().slice(0, 13) : unit === "month" ? d.toISOString().slice(0, 7) : d.toISOString().slice(0, 10));
  const byBucket = new Map(rows.map((r) => [keyOf(r.bucket), { views: Number(r.views), visitors: Number(r.visitors) }]));

  const points: { key: string; views: number; visitors: number }[] = [];
  if (unit === "hour") {
    for (let i = 0; i < 24; i++) {
      const d = new Date(since.getTime() + i * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 13);
      const entry = byBucket.get(key);
      points.push({ key, views: entry?.views ?? 0, visitors: entry?.visitors ?? 0 });
    }
  } else if (unit === "month") {
    for (let i = 0; i < 12; i++) {
      const d = new Date(since);
      d.setMonth(d.getMonth() + i);
      const key = d.toISOString().slice(0, 7);
      const entry = byBucket.get(key);
      points.push({ key, views: entry?.views ?? 0, visitors: entry?.visitors ?? 0 });
    }
  } else {
    const days = range === "7d" ? 7 : 30;
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const entry = byBucket.get(key);
      points.push({ key, views: entry?.views ?? 0, visitors: entry?.visitors ?? 0 });
    }
  }
  return points;
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

/**
 * Pays réel de connexion (§ demande produit 2026-09-18), par visiteurs
 * uniques plutôt que par pages vues : une personne qui consulte 10 pages ne
 * doit pas peser 10x plus qu'une personne qui en consulte 1 dans "d'où
 * viennent nos visiteurs". Voir geoCountryCode sur PageView (détection
 * Vercel, pas la préférence de langue).
 */
export async function countByGeoCountry(since: Date) {
  const rows = await prisma.$queryRaw<{ geoCountryCode: string | null; count: bigint }[]>`
    SELECT "geoCountryCode", count(DISTINCT "visitorId") as count
    FROM "PageView"
    WHERE "createdAt" >= ${since} AND "visitorId" IS NOT NULL
    GROUP BY "geoCountryCode"
    ORDER BY count DESC
  `;
  return rows.map((r) => ({ countryCode: r.geoCountryCode ?? "?", count: Number(r.count) }));
}
