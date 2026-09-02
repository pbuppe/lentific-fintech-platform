// Point d'entrée unique de la couche données.
// Règle §01 : les autres packages n'importent JAMAIS @prisma/client directement,
// ils passent uniquement par les fonctions exposées ici.

export { prisma } from "./client";

// Types et enums Prisma ré-exportés pour que les autres packages restent typés
// sans jamais importer PrismaClient eux-mêmes.
export type {
  User,
  Session,
  BorrowerProfile,
  InvestorProfile,
  Application,
  ApplicationStatusLog,
  Offer,
  Loan,
  LoanProduct,
  FundingOpportunity,
  InvestorListing,
  IntroductionRequest,
  DocumentRequest,
  Investment,
  Portfolio,
  Document,
  Contract,
  Signature,
  Payment,
  Repayment,
  Fee,
  Subscription,
  Country,
  Currency,
  Language,
  Rule,
  Tenant,
  Notification,
  Conversation,
  Message,
  SupportTicket,
  AuditLog,
} from "@prisma/client";

export {
  Role,
  ApplicationStatus,
  OfferStatus,
  InvestmentStatus,
  DocumentStatus,
  SignatureStatus,
  PaymentStatus,
  RepaymentStatus,
  InvestorListingStatus,
  IntroductionTargetType,
  IntroductionStatus,
  InvestorVerificationStatus,
  DocumentRequestStatus,
  SubscriptionStatus,
} from "@prisma/client";

export * as applicationsRepo from "./repositories/applications";
export * as loansRepo from "./repositories/loans";
export * as usersRepo from "./repositories/users";
export * as fundingRepo from "./repositories/funding";
export * as paymentsRepo from "./repositories/payments";
export * as documentsRepo from "./repositories/documents";
export * as rulesRepo from "./repositories/rules";
export * as feesRepo from "./repositories/fees";
export * as contractsRepo from "./repositories/contracts";
export * as signaturesRepo from "./repositories/signatures";
export * as offersRepo from "./repositories/offers";
export * as sessionsRepo from "./repositories/sessions";
export * as investorListingsRepo from "./repositories/investorListings";
export * as introductionsRepo from "./repositories/introductions";
export * as documentRequestsRepo from "./repositories/documentRequests";
export * as subscriptionsRepo from "./repositories/subscriptions";
export * as storedFilesRepo from "./repositories/storedFiles";
