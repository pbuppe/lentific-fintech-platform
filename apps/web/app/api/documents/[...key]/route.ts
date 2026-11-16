import { NextResponse } from "next/server";
import { readStoredFile } from "@fintech/documents";
import { prisma } from "@fintech/database";
import { getCurrentUser } from "../../../../lib/session";

const CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  txt: "text/plain",
};

const STAFF_ROLES = ["AGENT", "ADMIN", "SUPER_ADMIN"];

/**
 * Un client ne peut ouvrir que ses propres fichiers (2026-11-16, contrats et
 * mandats contiennent des données personnelles) : ses documents déposés ou
 * générés pour lui, le contrat de ses prêts (emprunteur ou investisseur du
 * prêt), et les contrats de prêt direct dont il est partie.
 */
async function canRead(user: { id: string; role: string }, storageKey: string) {
  if (STAFF_ROLES.includes(user.role)) return true;
  const [ownDocument, loanContract, directAgreement] = await Promise.all([
    prisma.document.findFirst({ where: { storageKey, ownerId: user.id }, select: { id: true } }),
    prisma.contract.findFirst({
      where: { storageKey },
      select: { loanId: true },
    }),
    prisma.directLoanAgreement.findFirst({
      where: {
        OR: [{ contractStorageKey: storageKey }, { signatureStorageKey: storageKey }],
        AND: [{ OR: [{ borrowerId: user.id }, { lenderId: user.id }] }],
      },
      select: { id: true },
    }),
  ]);
  if (ownDocument || directAgreement) return true;
  if (loanContract) {
    const loan = await prisma.loan.findUnique({
      where: { id: loanContract.loanId },
      select: {
        offer: { select: { application: { select: { borrowerId: true } } } },
        fundingOpportunity: { select: { investments: { where: { investorId: user.id }, select: { id: true } } } },
      },
    });
    if (loan?.offer.application.borrowerId === user.id) return true;
    if ((loan?.fundingOpportunity?.investments.length ?? 0) > 0) return true;
  }
  return false;
}

/** Sert un document stocké (stand-in pour un vrai bucket S3/R2 en production), à son seul titulaire. */
export async function GET(_request: Request, { params }: { params: { key: string[] } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const storageKey = params.key.join("/");
  if (!(await canRead(user, storageKey))) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }

  try {
    const content = await readStoredFile(storageKey);
    const extension = storageKey.split(".").pop()?.toLowerCase() ?? "";
    const contentType = CONTENT_TYPES[extension] ?? "application/octet-stream";
    return new NextResponse(new Uint8Array(content), { headers: { "Content-Type": contentType } });
  } catch {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }
}
