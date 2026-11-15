import { prisma } from "../client";

/**
 * Analyse des visites façon Matomo (demande produit 2026-11-15) : visites
 * (sessions de navigation), visiteurs en direct, parcours détaillé de chaque
 * visite et répartitions (appareil, système, navigateur, pays, sources).
 * Collecte : apps/web/app/api/track/route.ts. Les anciennes pages vues, sans
 * identifiant de visite, ne comptent que dans les totaux de pages vues.
 */

export interface VisitSummary {
  sessionId: string;
  visitorId: string | null;
  firstAt: Date;
  lastAt: Date;
  pages: number;
  durationMs: number;
  entryPath: string;
  currentPath: string;
  geoCountryCode: string | null;
  originCountryCode: string | null;
  city: string | null;
  region: string | null;
  deviceType: string | null;
  os: string | null;
  browser: string | null;
  screenWidth: number | null;
  referrer: string | null;
  utmSource: string | null;
  locale: string | null;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userRole: string | null;
  events: number;
  visitNumber: number;
}

type RawVisit = Omit<VisitSummary, "pages" | "durationMs" | "events" | "visitNumber" | "userName" | "userEmail" | "userRole"> & {
  pages: bigint;
  durationMs: bigint | number | null;
};

async function enrich(rows: RawVisit[]): Promise<VisitSummary[]> {
  if (rows.length === 0) return [];
  const sessionIds = rows.map((r) => r.sessionId);
  const visitorIds = [...new Set(rows.map((r) => r.visitorId).filter((v): v is string => !!v))];
  const userIds = [...new Set(rows.map((r) => r.userId).filter((v): v is string => !!v))];
  const [events, visitCounts, users] = await Promise.all([
    prisma.trackEvent.groupBy({ by: ["sessionId"], where: { sessionId: { in: sessionIds } }, _count: true }),
    visitorIds.length
      ? prisma.$queryRaw<{ visitorId: string; sessionId: string; n: bigint }[]>`
          SELECT "visitorId", "sessionId", rank() OVER (PARTITION BY "visitorId" ORDER BY min("createdAt")) AS n
          FROM "PageView" WHERE "visitorId" = ANY(${visitorIds}) AND "sessionId" IS NOT NULL
          GROUP BY "visitorId", "sessionId"`
      : Promise.resolve([]),
    userIds.length ? prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true, role: true } }) : Promise.resolve([]),
  ]);
  return rows.map((r) => {
    const u = users.find((x) => x.id === r.userId);
    return {
      ...r,
      pages: Number(r.pages),
      durationMs: Number(r.durationMs ?? 0),
      events: events.find((e) => e.sessionId === r.sessionId)?._count ?? 0,
      visitNumber: Number(visitCounts.find((v) => v.sessionId === r.sessionId)?.n ?? 1),
      userName: u?.name ?? null,
      userEmail: u?.email ?? null,
      userRole: u?.role ?? null,
    };
  });
}

/**
 * Visites dont la dernière activité est postérieure à `activeSince`, commencées
 * après `startedSince`. Durée = temps mesuré sur les pages, ou à défaut l'écart
 * entre la première et la dernière page.
 */
async function queryVisits(opts: { activeSince: Date; limit: number; offset?: number; device?: string; country?: string; visitorId?: string }) {
  const device = opts.device ?? null;
  const country = opts.country ?? null;
  const visitor = opts.visitorId ?? null;
  const rows = await prisma.$queryRaw<RawVisit[]>`
    SELECT "sessionId",
      max("visitorId") AS "visitorId",
      min("createdAt") AS "firstAt",
      max("createdAt") AS "lastAt",
      count(*) AS pages,
      GREATEST(coalesce(sum("durationMs"), 0), (extract(epoch FROM (max("createdAt") - min("createdAt"))) * 1000)::bigint) AS "durationMs",
      (array_agg("path" ORDER BY "createdAt" ASC))[1] AS "entryPath",
      (array_agg("path" ORDER BY "createdAt" DESC))[1] AS "currentPath",
      max("geoCountryCode") AS "geoCountryCode",
      max("countryCode") AS "originCountryCode",
      max("city") AS city,
      max("region") AS region,
      max("deviceType") AS "deviceType",
      max("os") AS os,
      max("browser") AS browser,
      max("screenWidth") AS "screenWidth",
      (array_agg("referrer" ORDER BY "createdAt" ASC))[1] AS referrer,
      max("utmSource") AS "utmSource",
      (array_agg("locale" ORDER BY "createdAt" DESC))[1] AS locale,
      max("userId") AS "userId"
    FROM "PageView"
    WHERE "sessionId" IS NOT NULL AND "createdAt" >= ${new Date(opts.activeSince.getTime() - 12 * 3600 * 1000)}
    GROUP BY "sessionId"
    HAVING max("createdAt") >= ${opts.activeSince}
      AND (${device}::text IS NULL OR max("deviceType") = ${device}::text)
      AND (${country}::text IS NULL OR max("geoCountryCode") = ${country}::text)
      AND (${visitor}::text IS NULL OR max("visitorId") = ${visitor}::text)
    ORDER BY max("createdAt") DESC
    LIMIT ${opts.limit} OFFSET ${opts.offset ?? 0}`;
  return enrich(rows);
}

/** Visiteurs en direct : activité dans les `minutes` dernières minutes. */
export function liveVisits(minutes = 5) {
  return queryVisits({ activeSince: new Date(Date.now() - minutes * 60 * 1000), limit: 100 });
}

/** Visites récentes de la période, les plus récentes d'abord. */
export function recentVisits(since: Date, opts: { limit?: number; offset?: number; device?: string; country?: string } = {}) {
  return queryVisits({ activeSince: since, limit: opts.limit ?? 30, offset: opts.offset, device: opts.device, country: opts.country });
}

export type JourneyStep =
  | { type: "page"; at: Date; path: string; durationMs: number | null }
  | { type: "event"; at: Date; path: string; kind: string; label: string; target: string | null };

/** Parcours chronologique de chaque visite : pages vues (avec temps passé) et actions. */
export async function journeys(sessionIds: string[]) {
  if (sessionIds.length === 0) return new Map<string, JourneyStep[]>();
  const [pages, events] = await Promise.all([
    prisma.pageView.findMany({ where: { sessionId: { in: sessionIds } }, orderBy: { createdAt: "asc" }, select: { sessionId: true, createdAt: true, path: true, durationMs: true } }),
    prisma.trackEvent.findMany({ where: { sessionId: { in: sessionIds } }, orderBy: { createdAt: "asc" }, take: 2000, select: { sessionId: true, createdAt: true, path: true, kind: true, label: true, target: true } }),
  ]);
  const map = new Map<string, JourneyStep[]>();
  for (const p of pages) {
    const list = map.get(p.sessionId!) ?? [];
    list.push({ type: "page", at: p.createdAt, path: p.path, durationMs: p.durationMs });
    map.set(p.sessionId!, list);
  }
  for (const e of events) {
    const list = map.get(e.sessionId!) ?? [];
    list.push({ type: "event", at: e.createdAt, path: e.path, kind: e.kind, label: e.label, target: e.target });
    map.set(e.sessionId!, list);
  }
  for (const list of map.values()) list.sort((a, b) => a.at.getTime() - b.at.getTime());
  return map;
}

/** Indicateurs clés de la période : visites, visiteurs, pages par visite, durée moyenne, taux de rebond. */
export async function visitKpis(since: Date) {
  const rows = await prisma.$queryRaw<{ visits: bigint; visitors: bigint; avgPages: number | null; avgMs: number | null; bounces: bigint; members: bigint }[]>`
    WITH s AS (
      SELECT "sessionId", max("visitorId") AS v, count(*) AS pages, max("userId") AS u,
        GREATEST(coalesce(sum("durationMs"), 0), (extract(epoch FROM (max("createdAt") - min("createdAt"))) * 1000)::bigint) AS ms
      FROM "PageView" WHERE "sessionId" IS NOT NULL AND "createdAt" >= ${since}
      GROUP BY "sessionId"
    )
    SELECT count(*) AS visits, count(DISTINCT v) AS visitors, avg(pages)::float AS "avgPages", avg(ms)::float AS "avgMs",
      count(*) FILTER (WHERE pages = 1) AS bounces, count(DISTINCT u) AS members
    FROM s`;
  const r = rows[0];
  const visits = Number(r?.visits ?? 0);
  return {
    visits,
    visitors: Number(r?.visitors ?? 0),
    avgPages: r?.avgPages ?? 0,
    avgMs: r?.avgMs ?? 0,
    bounceRate: visits ? Number(r!.bounces) / visits : 0,
    members: Number(r?.members ?? 0),
  };
}

const BREAKDOWN_COLUMNS = {
  device: `"deviceType"`,
  os: `"os"`,
  browser: `"browser"`,
  geo: `"geoCountryCode"`,
  origin: `"countryCode"`,
  city: `"city"`,
  utm: `"utmSource"`,
} as const;

/** Répartition des visites (sessions distinctes) selon une dimension. */
export async function breakdown(since: Date, dim: keyof typeof BREAKDOWN_COLUMNS, limit = 12) {
  const col = BREAKDOWN_COLUMNS[dim];
  const rows = await prisma.$queryRawUnsafe<{ key: string | null; geo: string | null; count: bigint }[]>(
    `SELECT ${col} AS key, max("geoCountryCode") AS geo, count(DISTINCT coalesce("sessionId", "visitorId", id)) AS count
     FROM "PageView" WHERE "createdAt" >= $1
     GROUP BY ${col} ORDER BY count DESC LIMIT ${Math.max(1, Math.min(50, limit))}`,
    since
  );
  return rows.map((r) => ({ key: r.key, geo: r.geo, count: Number(r.count) }));
}

/** Sites d'où arrivent les visiteurs (domaine du référent de la première page de chaque visite). */
export async function topReferrers(since: Date, limit = 10) {
  const rows = await prisma.$queryRaw<{ host: string | null; count: bigint }[]>`
    WITH first AS (
      SELECT DISTINCT ON ("sessionId") "sessionId", "referrer"
      FROM "PageView" WHERE "sessionId" IS NOT NULL AND "createdAt" >= ${since}
      ORDER BY "sessionId", "createdAt" ASC
    )
    SELECT CASE WHEN referrer IS NULL OR referrer = '' THEN NULL ELSE substring(referrer FROM '^https?://(?:www\\.)?([^/:?#]+)') END AS host, count(*) AS count
    FROM first GROUP BY host ORDER BY count DESC LIMIT ${limit}`;
  return rows.map((r) => ({ host: r.host, count: Number(r.count) }));
}

/** Actions les plus fréquentes de la période (clics, formulaires, liens sortants). */
export async function topEvents(since: Date, limit = 12) {
  const rows = await prisma.trackEvent.groupBy({
    by: ["kind", "label"],
    where: { createdAt: { gte: since } },
    _count: true,
    orderBy: { _count: { label: "desc" } },
    take: limit,
  });
  return rows.map((r) => ({ kind: r.kind, label: r.label, count: r._count }));
}

/** Pages d'entrée (première page de chaque visite). */
export async function topEntryPages(since: Date, limit = 8) {
  const rows = await prisma.$queryRaw<{ path: string; count: bigint }[]>`
    WITH first AS (
      SELECT DISTINCT ON ("sessionId") "sessionId", "path"
      FROM "PageView" WHERE "sessionId" IS NOT NULL AND "createdAt" >= ${since}
      ORDER BY "sessionId", "createdAt" ASC
    )
    SELECT path, count(*) AS count FROM first GROUP BY path ORDER BY count DESC LIMIT ${limit}`;
  return rows.map((r) => ({ path: r.path, count: Number(r.count) }));
}

/** Pages les plus vues, avec le temps moyen passé sur chacune. */
export async function topPagesWithTime(since: Date, limit = 10) {
  const rows = await prisma.$queryRaw<{ path: string; views: bigint; avgMs: number | null }[]>`
    SELECT "path", count(*) AS views, avg("durationMs")::float AS "avgMs"
    FROM "PageView" WHERE "createdAt" >= ${since}
    GROUP BY "path" ORDER BY views DESC LIMIT ${limit}`;
  return rows.map((r) => ({ path: r.path, views: Number(r.views), avgMs: r.avgMs ?? null }));
}

/** Visites par intervalle (heure / jour / mois), pour la courbe d'évolution. */
export async function visitsSeries(since: Date, unit: "hour" | "day" | "month") {
  const rows = await prisma.$queryRaw<{ bucket: Date; visits: bigint }[]>`
    SELECT date_trunc(${unit}, "createdAt") AS bucket, count(DISTINCT "sessionId") AS visits
    FROM "PageView" WHERE "createdAt" >= ${since} AND "sessionId" IS NOT NULL
    GROUP BY bucket ORDER BY bucket ASC`;
  return rows.map((r) => ({ bucket: r.bucket, visits: Number(r.visits) }));
}

/**
 * Visites anonymes (cookies refusés ou pas encore acceptés, bandeau du
 * 2026-11-16) : pages vues sans identifiant, avec pays, ville et appareil.
 */
export async function anonymousLive(minutes = 5) {
  return prisma.pageView.findMany({
    where: { sessionId: null, visitorId: null, createdAt: { gte: new Date(Date.now() - minutes * 60 * 1000) } },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, createdAt: true, path: true, geoCountryCode: true, countryCode: true, city: true, deviceType: true, os: true, browser: true, durationMs: true },
  });
}

export function anonymousViewsSince(since: Date) {
  return prisma.pageView.count({ where: { sessionId: null, visitorId: null, createdAt: { gte: since } } });
}

// ---------------------------------------------------------------------------
// Liste des visiteurs et fiche visiteur (demande produit 2026-11-16) : une ligne
// par visiteur (cookie NEXT_VISITOR_ID, donc visiteurs ayant accepté les
// cookies), nouveau ou revenant, nombre de visites depuis la première, temps
// total, actions ; filtres pays / type d'action ; historique complet.
// ---------------------------------------------------------------------------

export interface VisitorRow {
  visitorId: string;
  firstAt: Date;
  lastAt: Date;
  totalVisits: number;
  periodVisits: number;
  pages: number;
  durationMs: number;
  geoCountryCode: string | null;
  originCountryCode: string | null;
  city: string | null;
  deviceType: string | null;
  os: string | null;
  browser: string | null;
  userId: string | null;
  userName: string | null;
  actions: { click: number; submit: number; outbound: number; download: number; total: number };
  lastActions: string[];
}

export async function visitorsTable(since: Date, opts: { country?: string; action?: string; limit?: number } = {}) {
  const country = opts.country ?? null;
  const action = opts.action ?? null;
  const limit = Math.max(1, Math.min(200, opts.limit ?? 50));
  const rows = await prisma.$queryRaw<{
    visitorId: string; lastAt: Date; periodVisits: bigint; pages: bigint; durationMs: bigint | null;
    geoCountryCode: string | null; originCountryCode: string | null; city: string | null;
    deviceType: string | null; os: string | null; browser: string | null; userId: string | null;
  }[]>`
    SELECT "visitorId",
      max("createdAt") AS "lastAt",
      count(DISTINCT "sessionId") AS "periodVisits",
      count(*) AS pages,
      coalesce(sum("durationMs"), 0)::bigint AS "durationMs",
      (array_agg("geoCountryCode" ORDER BY "createdAt" DESC))[1] AS "geoCountryCode",
      (array_agg("countryCode" ORDER BY "createdAt" DESC))[1] AS "originCountryCode",
      (array_agg("city" ORDER BY "createdAt" DESC))[1] AS city,
      (array_agg("deviceType" ORDER BY "createdAt" DESC))[1] AS "deviceType",
      (array_agg("os" ORDER BY "createdAt" DESC))[1] AS os,
      (array_agg("browser" ORDER BY "createdAt" DESC))[1] AS browser,
      max("userId") AS "userId"
    FROM "PageView" pv
    WHERE "visitorId" IS NOT NULL AND "sessionId" IS NOT NULL AND "createdAt" >= ${since}
      AND (${action}::text IS NULL OR EXISTS (
        SELECT 1 FROM "TrackEvent" e WHERE e."visitorId" = pv."visitorId" AND e."kind" = ${action}::text AND e."createdAt" >= ${since}))
    GROUP BY "visitorId"
    HAVING (${country}::text IS NULL OR (array_agg("geoCountryCode" ORDER BY "createdAt" DESC))[1] = ${country}::text)
    ORDER BY max("createdAt") DESC
    LIMIT ${limit}`;
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.visitorId);
  const userIds = [...new Set(rows.map((r) => r.userId).filter((v): v is string => !!v))];
  const [totals, events, recent, users] = await Promise.all([
    prisma.$queryRaw<{ visitorId: string; totalVisits: bigint; firstAt: Date }[]>`
      SELECT "visitorId", count(DISTINCT "sessionId") AS "totalVisits", min("createdAt") AS "firstAt"
      FROM "PageView" WHERE "visitorId" = ANY(${ids}) AND "sessionId" IS NOT NULL GROUP BY "visitorId"`,
    prisma.trackEvent.groupBy({ by: ["visitorId", "kind"], where: { visitorId: { in: ids }, createdAt: { gte: since } }, _count: true }),
    prisma.trackEvent.findMany({ where: { visitorId: { in: ids }, createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, take: 1000, select: { visitorId: true, kind: true, label: true } }),
    userIds.length ? prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true } }) : Promise.resolve([]),
  ]);
  return rows.map<VisitorRow>((r) => {
    const tot = totals.find((x) => x.visitorId === r.visitorId);
    const ev = (k: string) => events.find((e) => e.visitorId === r.visitorId && e.kind === k)?._count ?? 0;
    const actions = { click: ev("click"), submit: ev("submit"), outbound: ev("outbound"), download: ev("download"), total: 0 };
    actions.total = actions.click + actions.submit + actions.outbound + actions.download;
    const u = users.find((x) => x.id === r.userId);
    return {
      visitorId: r.visitorId,
      firstAt: tot?.firstAt ?? r.lastAt,
      lastAt: r.lastAt,
      totalVisits: Number(tot?.totalVisits ?? r.periodVisits),
      periodVisits: Number(r.periodVisits),
      pages: Number(r.pages),
      durationMs: Number(r.durationMs ?? 0),
      geoCountryCode: r.geoCountryCode,
      originCountryCode: r.originCountryCode,
      city: r.city,
      deviceType: r.deviceType,
      os: r.os,
      browser: r.browser,
      userId: r.userId,
      userName: u?.name ?? u?.email ?? null,
      actions,
      lastActions: recent.filter((e) => e.visitorId === r.visitorId).slice(0, 3).map((e) => e.label),
    };
  });
}

/** Toutes les visites d'un visiteur, de la plus récente à la toute première. */
export function visitorHistory(visitorId: string, limit = 100) {
  return queryVisits({ activeSince: new Date(0), limit, visitorId });
}
