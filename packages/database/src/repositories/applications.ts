import { prisma } from "../client";
import type { ApplicationStatus } from "@prisma/client";

export function findById(id: string) {
  return prisma.application.findUnique({
    where: { id },
    include: {
      offers: { include: { loan: { include: { fundingOpportunity: true } } } },
      documents: true,
      statusHistory: true,
    },
  });
}

export function listByBorrower(borrowerId: string) {
  return prisma.application.findMany({
    where: { borrowerId },
    include: {
      offers: { include: { loan: { include: { fundingOpportunity: true } } } },
      documents: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export function listByStatus(status: ApplicationStatus) {
  return prisma.application.findMany({ where: { status } });
}

export function setScore(applicationId: string, score: number) {
  return prisma.application.update({ where: { id: applicationId }, data: { score } });
}

const SLA_PENDING_STATUSES: ApplicationStatus[] = ["SUBMITTED", "KYC_PENDING", "KYC_VERIFIED", "UNDER_REVIEW"];

/** Active l'option "Dossier Prioritaire" (49 €, payée d'avance) : SLA de 48h sur la revue. */
export function setPriority(applicationId: string, slaDeadline: Date) {
  return prisma.application.update({
    where: { id: applicationId },
    data: { priority: true, priorityRequestedAt: new Date(), slaDeadline },
  });
}

/** Dossiers prioritaires encore en cours de revue, triés en tête pour la file back-office. */
export function listPriorityQueue() {
  return prisma.application.findMany({
    where: { priority: true, status: { in: SLA_PENDING_STATUSES } },
    orderBy: { slaDeadline: "asc" },
  });
}

/**
 * Dossiers prioritaires dont le SLA de 48h vient d'être dépassé et pas encore
 * relancés (slaBreachedAt encore vide, pour ne relancer qu'une seule fois).
 */
export function listOverdueSla(now: Date) {
  return prisma.application.findMany({
    where: {
      priority: true,
      status: { in: SLA_PENDING_STATUSES },
      slaDeadline: { lt: now },
      slaBreachedAt: null,
    },
  });
}

export function markSlaBreached(applicationId: string) {
  return prisma.application.update({ where: { id: applicationId }, data: { slaBreachedAt: new Date() } });
}

export function create(data: {
  reference: string;
  borrowerId: string;
  productId: string;
  amount: number;
  durationMonths: number;
  purpose: string;
  countryId: string;
  currencyId: string;
}) {
  return prisma.application.create({ data });
}

/**
 * Change d'état une demande ET journalise la transition (ApplicationStatusLog).
 * Ne déclenche pas d'événement lui-même, c'est @fintech/workflow qui écoute
 * les changements d'état importants et orchestre la suite (règle §02).
 */
export async function transitionStatus(
  applicationId: string,
  toStatus: ApplicationStatus,
  actorId?: string
) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.application.findUniqueOrThrow({ where: { id: applicationId } });
    const updated = await tx.application.update({
      where: { id: applicationId },
      data: { status: toStatus },
    });
    await tx.applicationStatusLog.create({
      data: {
        applicationId,
        fromStatus: current.status,
        toStatus,
        actorId,
      },
    });
    return updated;
  });
}
