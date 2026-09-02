import { prisma } from "../client";

export function create(data: {
  targetUserId: string;
  requestedById: string;
  label: string;
  instructions?: string;
}) {
  return prisma.documentRequest.create({ data });
}

export function findById(id: string) {
  return prisma.documentRequest.findUnique({ where: { id } });
}

export function listForUser(targetUserId: string) {
  return prisma.documentRequest.findMany({
    where: { targetUserId },
    include: { document: true, requestedBy: true },
    orderBy: { createdAt: "desc" },
  });
}

export function listAll() {
  return prisma.documentRequest.findMany({
    include: { document: true, targetUser: true, requestedBy: true },
    orderBy: { createdAt: "desc" },
  });
}

export function fulfill(id: string, documentId: string) {
  return prisma.documentRequest.update({
    where: { id },
    data: { status: "FULFILLED", documentId, fulfilledAt: new Date() },
  });
}

export function cancel(id: string) {
  return prisma.documentRequest.update({ where: { id }, data: { status: "CANCELLED" } });
}
