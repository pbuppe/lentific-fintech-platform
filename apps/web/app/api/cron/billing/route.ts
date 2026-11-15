import { NextResponse, type NextRequest } from "next/server";

/**
 * Tâche planifiée Vercel (voir apps/web/vercel.json) : sur Vercel, le site ne
 * tourne pas en continu, donc le balayage de instrumentation-node.ts n'est pas
 * garanti. Cette route relit chaque jour les abonnements PayPal (renouvellements,
 * échecs, résiliations) et relance les dossiers prioritaires en retard.
 * Protégée par CRON_SECRET (Vercel envoie « Authorization: Bearer <CRON_SECRET> »).
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const [{ prisma }, { processDueSubscriptions }, { checkSlaBreaches }] = await Promise.all([
    import("@fintech/database"),
    import("@fintech/payments"),
    import("@fintech/applications"),
  ]);
  const eur = await prisma.currency.findUnique({ where: { code: "EUR" } });
  const subscriptions = eur ? await processDueSubscriptions(eur.id) : 0;
  const slaBreaches = await checkSlaBreaches();
  return NextResponse.json({ ok: true, subscriptions, slaBreaches });
}
