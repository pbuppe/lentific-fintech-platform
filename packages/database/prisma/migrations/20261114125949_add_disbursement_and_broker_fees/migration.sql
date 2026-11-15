-- CreateEnum
CREATE TYPE "DisbursementStatus" AS ENUM ('DECLARED', 'CONFIRMED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FundsBeneficiary" AS ENUM ('BORROWER', 'NOTARY', 'SUPPLIERS');

-- CreateEnum
CREATE TYPE "FundsAvailability" AS ENUM ('AVAILABLE', 'BANK_CHECKS', 'NOTARY_CHECKS');

-- CreateEnum
CREATE TYPE "BrokerFeeStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "Disbursement" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" "DisbursementStatus" NOT NULL DEFAULT 'DECLARED',
    "beneficiary" "FundsBeneficiary" NOT NULL,
    "availability" "FundsAvailability" NOT NULL,
    "fundsDate" TIMESTAMP(3) NOT NULL,
    "lenderReference" TEXT NOT NULL,
    "proofStorageKey" TEXT NOT NULL,
    "proofFileName" TEXT NOT NULL,
    "declaredById" TEXT NOT NULL,
    "declaredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedById" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "availableAt" TIMESTAMP(3),

    CONSTRAINT "Disbursement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerFeeRequest" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "BrokerFeeStatus" NOT NULL DEFAULT 'PENDING',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "paymentId" TEXT,

    CONSTRAINT "BrokerFeeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Disbursement_applicationId_key" ON "Disbursement"("applicationId");

-- CreateIndex
CREATE INDEX "Disbursement_status_idx" ON "Disbursement"("status");

-- CreateIndex
CREATE INDEX "BrokerFeeRequest_applicationId_idx" ON "BrokerFeeRequest"("applicationId");

-- CreateIndex
CREATE INDEX "BrokerFeeRequest_userId_status_idx" ON "BrokerFeeRequest"("userId", "status");

-- AddForeignKey
ALTER TABLE "Disbursement" ADD CONSTRAINT "Disbursement_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerFeeRequest" ADD CONSTRAINT "BrokerFeeRequest_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerFeeRequest" ADD CONSTRAINT "BrokerFeeRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
