/**
 * packages/users : identité et profils (§04).
 */
import { usersRepo, type Role } from "@fintech/database";

export function getUser(userId: string) {
  return usersRepo.findById(userId);
}

export function registerUser(input: { email: string; countryId: string; role: Role; phone?: string }) {
  return usersRepo.create(input);
}

export function completeBorrowerProfile(
  userId: string,
  profile: { address: object; employment: object; income: number; expenses: number; existingDebt: number }
) {
  return usersRepo.upsertBorrowerProfile(userId, profile);
}

export function completeInvestorProfile(
  userId: string,
  profile: { riskTolerance: "low" | "moderate" | "high"; autoInvestRules?: object }
) {
  return usersRepo.upsertInvestorProfile(userId, profile);
}
