-- CreateEnum
CREATE TYPE "DirectLoanAgreementStatus" AS ENUM ('DRAFT', 'CONTRACT_GENERATED', 'SIGNED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferredLocale" TEXT;

-- CreateTable
CREATE TABLE "DirectLoanAgreement" (
    "id" TEXT NOT NULL,
    "introductionRequestId" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "status" "DirectLoanAgreementStatus" NOT NULL DEFAULT 'DRAFT',
    "contractStorageKey" TEXT,
    "contractGeneratedAt" TIMESTAMP(3),
    "signatureStorageKey" TEXT,
    "signedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DirectLoanAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DirectLoanAgreement_introductionRequestId_key" ON "DirectLoanAgreement"("introductionRequestId");

-- CreateIndex
CREATE INDEX "DirectLoanAgreement_borrowerId_idx" ON "DirectLoanAgreement"("borrowerId");

-- CreateIndex
CREATE INDEX "DirectLoanAgreement_lenderId_idx" ON "DirectLoanAgreement"("lenderId");

-- AddForeignKey
ALTER TABLE "DirectLoanAgreement" ADD CONSTRAINT "DirectLoanAgreement_introductionRequestId_fkey" FOREIGN KEY ("introductionRequestId") REFERENCES "IntroductionRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectLoanAgreement" ADD CONSTRAINT "DirectLoanAgreement_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectLoanAgreement" ADD CONSTRAINT "DirectLoanAgreement_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
