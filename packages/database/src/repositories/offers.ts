import { prisma } from "../client";
import type { OfferStatus } from "@prisma/client";

export function create(data: {
  applicationId: string;
  amount: number;
  durationMonths: number;
  rate: number;
}) {
  return prisma.offer.create({ data });
}

export function findById(id: string) {
  return prisma.offer.findUnique({ where: { id }, include: { application: true } });
}

export function listForApplication(applicationId: string) {
  return prisma.offer.findMany({ where: { applicationId }, orderBy: { id: "desc" } });
}

export function updateStatus(id: string, status: OfferStatus) {
  return prisma.offer.update({ where: { id }, data: { status } });
}
