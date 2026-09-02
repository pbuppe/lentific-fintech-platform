import { prisma } from "../client";
import type { InvestorListingStatus } from "@prisma/client";

export function create(data: {
  investorId: string;
  amountAvailable: number;
  preferredRate: number;
  preferredDurationMonths: number;
  riskAppetite: string;
}) {
  return prisma.investorListing.create({ data });
}

export function listOpen() {
  return prisma.investorListing.findMany({
    where: { status: "OPEN" },
    include: { investor: { include: { investorProfile: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export function listForInvestor(investorId: string) {
  return prisma.investorListing.findMany({
    where: { investorId },
    orderBy: { createdAt: "desc" },
  });
}

export function setStatus(id: string, status: InvestorListingStatus) {
  return prisma.investorListing.update({ where: { id }, data: { status } });
}
