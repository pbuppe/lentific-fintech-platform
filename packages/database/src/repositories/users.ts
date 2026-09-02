import { prisma } from "../client";
import type { Role, InvestorVerificationStatus } from "@prisma/client";

export function findById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { borrowerProfile: true, investorProfile: true },
  });
}

export function findByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

/** Vue complète d'un compte pour le back-office (§ super administrateur : "plein pouvoir"). */
export function findAccountDetail(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      borrowerProfile: true,
      investorProfile: true,
      applications: true,
      investorListings: true,
      documents: true,
      introductionsSent: { include: { targetUser: true } },
      introductionsReceived: { include: { requester: true } },
    },
  });
}

/** Liste de tous les comptes emprunteurs/investisseurs (hors équipe interne), pour le back-office. */
export function listAccounts() {
  return prisma.user.findMany({
    where: { role: { in: ["BORROWER", "INVESTOR"] } },
    include: { borrowerProfile: true, investorProfile: true },
    orderBy: { createdAt: "desc" },
  });
}

/** Investisseurs Premium actifs, pour les alertes automatiques sur nouveaux dossiers. */
export function listActivePremiumInvestors() {
  return prisma.investorProfile.findMany({
    where: { user: { subscription: { status: "ACTIVE" } } },
    include: { user: true },
  });
}

export function create(data: {
  email: string;
  countryId: string;
  role: Role;
  phone?: string;
  name?: string;
  passwordHash?: string;
}) {
  return prisma.user.create({ data });
}

export function setPassword(userId: string, passwordHash: string) {
  return prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

export function upsertBorrowerProfile(
  userId: string,
  data: { address: object; employment: object; income: number; expenses: number; existingDebt: number }
) {
  return prisma.borrowerProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

export function upsertInvestorProfile(
  userId: string,
  data: { riskTolerance: string; autoInvestRules?: object }
) {
  return prisma.investorProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

export function setInvestorVerificationStatus(
  userId: string,
  status: InvestorVerificationStatus,
  extra?: { verifiedAt?: Date; rejectionReason?: string | null }
) {
  return prisma.investorProfile.upsert({
    where: { userId },
    create: { userId, riskTolerance: "moderate", verificationStatus: status, ...extra },
    update: { verificationStatus: status, ...extra },
  });
}

export function listPendingInvestorVerifications() {
  return prisma.investorProfile.findMany({
    where: { verificationStatus: "PENDING_REVIEW" },
    include: { user: { include: { documents: true } } },
  });
}
