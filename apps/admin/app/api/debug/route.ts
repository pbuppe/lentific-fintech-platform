import { NextResponse } from "next/server";
import { prisma } from "@fintech/database";

// Route de diagnostic temporaire (§ déploiement) : à supprimer une fois le
// problème de connexion identifié, ne doit jamais rester en production.
export async function GET() {
  try {
    const count = await prisma.user.count();
    return NextResponse.json({ ok: true, userCount: count });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
