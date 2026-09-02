-- CreateEnum
CREATE TYPE "InvestorVerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "InvestorProfile" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "verificationStatus" "InvestorVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
ADD COLUMN     "verifiedAt" TIMESTAMP(3);
