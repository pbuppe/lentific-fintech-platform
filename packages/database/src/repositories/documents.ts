import { prisma } from "../client";
import type { DocumentStatus } from "@prisma/client";

export function create(data: {
  ownerId: string;
  applicationId?: string;
  type: string;
  storageKey: string;
}) {
  return prisma.document.create({ data });
}

export function setStatus(documentId: string, status: DocumentStatus) {
  return prisma.document.update({ where: { id: documentId }, data: { status } });
}

export function listForApplication(applicationId: string) {
  return prisma.document.findMany({ where: { applicationId } });
}

export function listForOwner(ownerId: string) {
  return prisma.document.findMany({ where: { ownerId }, orderBy: { id: "desc" } });
}
