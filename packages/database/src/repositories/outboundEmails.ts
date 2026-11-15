import { prisma } from "../client";

export function create(data: {
  userId?: string | null;
  to: string;
  subject: string;
  text: string;
  html: string;
  kind: string;
  status: "LOCAL" | "SENT" | "FAILED";
  error?: string | null;
}) {
  return prisma.outboundEmail.create({ data });
}

/** Derniers e-mails émis, pour la boîte d'envoi du back-office. */
export function listRecent(limit = 50) {
  return prisma.outboundEmail.findMany({ orderBy: { createdAt: "desc" }, take: limit });
}
