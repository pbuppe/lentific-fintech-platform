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

// countryCode filtre par pays de résidence de l'investisseur (§ marketplace
// géographique), undefined = tous pays confondus.
export function listOpen(countryCode?: string) {
  return prisma.investorListing.findMany({
    where: countryCode ? { status: "OPEN", investor: { country: { code: countryCode } } } : { status: "OPEN" },
    include: { investor: { include: { investorProfile: true, country: { include: { currency: true } } } } },
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
