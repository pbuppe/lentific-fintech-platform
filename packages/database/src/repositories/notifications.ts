import { prisma } from "../client";

const senderSelect = { select: { id: true, name: true, email: true, role: true } } as const;

export function create(data: {
  userId: string;
  event: string;
  channel?: string;
  kind?: string;
  title?: string;
  body?: string;
  link?: string;
  senderId?: string;
  refId?: string;
}) {
  return prisma.notification.create({ data: { channel: "in_app", ...data } });
}

export function listForUser(userId: string, options: { kind?: string; take?: number } = {}) {
  return prisma.notification.findMany({
    where: { userId, ...(options.kind ? { kind: options.kind } : {}) },
    include: { sender: senderSelect },
    orderBy: { createdAt: "desc" },
    take: options.take ?? 100,
  });
}

export function countUnread(userId: string, kind?: string) {
  return prisma.notification.count({ where: { userId, readAt: null, ...(kind ? { kind } : {}) } });
}

export function findForUser(id: string, userId: string) {
  return prisma.notification.findFirst({ where: { id, userId } });
}

export function markRead(id: string, userId: string) {
  return prisma.notification.updateMany({ where: { id, userId, readAt: null }, data: { readAt: new Date() } });
}

export function markAllRead(userId: string, kind?: string) {
  return prisma.notification.updateMany({
    where: { userId, readAt: null, ...(kind ? { kind } : {}) },
    data: { readAt: new Date() },
  });
}

/** Historique des envois de l'équipe (demandes et messages), le plus récent d'abord. */
export function listSent(options: { userId?: string; take?: number } = {}) {
  return prisma.notification.findMany({
    where: { kind: { in: ["document", "payment", "message"] }, ...(options.userId ? { userId: options.userId } : {}) },
    include: { sender: senderSelect, user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: options.take ?? 30,
  });
}
