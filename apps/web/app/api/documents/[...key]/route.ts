import { NextResponse } from "next/server";
import { readStoredFile } from "@fintech/documents";
import { getCurrentUser } from "../../../../lib/session";

const CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  txt: "text/plain",
};

/**
 * Sert un document stocké (stand-in pour un vrai bucket S3/R2 en production).
 * Limite volontaire de cette version : n'importe quel compte connecté peut
 * lire n'importe quel document tant qu'il connaît sa clé : il manque une
 * vraie vérification "ce document m'appartient ou je suis agent/admin" avant
 * un usage réel avec des données sensibles.
 */
export async function GET(_request: Request, { params }: { params: { key: string[] } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const storageKey = params.key.join("/");

  try {
    const content = await readStoredFile(storageKey);
    const extension = storageKey.split(".").pop()?.toLowerCase() ?? "";
    const contentType = CONTENT_TYPES[extension] ?? "application/octet-stream";
    return new NextResponse(new Uint8Array(content), { headers: { "Content-Type": contentType } });
  } catch {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }
}
