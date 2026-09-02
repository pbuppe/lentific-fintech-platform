-- CreateEnum
CREATE TYPE "InvestorListingStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "InvestorListing" (
    "id" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "amountAvailable" DECIMAL(65,30) NOT NULL,
    "preferredRate" DECIMAL(65,30) NOT NULL,
    "preferredDurationMonths" INTEGER NOT NULL,
    "riskAppetite" TEXT NOT NULL DEFAULT 'moderate',
    "status" "InvestorListingStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestorListing_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InvestorListing" ADD CONSTRAINT "InvestorListing_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
