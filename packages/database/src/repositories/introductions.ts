import { prisma } from "../client";
import type { IntroductionTargetType } from "@prisma/client";

export function create(data: {
  requesterId: string;
  targetUserId: string;
  targetType: IntroductionTargetType;
  targetId: string;
  message?: string;
}) {
  return prisma.introductionRequest.create({ data });
}

export function findById(id: string) {
  return prisma.introductionRequest.findUnique({
    where: { id },
    include: { requester: true, targetUser: true },
  });
}

export function setPaid(id: string) {
  return prisma.introductionRequest.update({
    where: { id },
    data: { status: "PAID", paidAt: new Date() },
  });
}

export function listSentBy(userId: string) {
  return prisma.introductionRequest.findMany({
    where: { requesterId: userId },
    include: { targetUser: { include: { investorProfile: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export function listReceivedBy(userId: string) {
  return prisma.introductionRequest.findMany({
    where: { targetUserId: userId },
    include: { requester: { include: { investorProfile: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export function findExisting(requesterId: string, targetType: IntroductionTargetType, targetId: string) {
  return prisma.introductionRequest.findFirst({
    where: { requesterId, targetType, targetId },
  });
}
