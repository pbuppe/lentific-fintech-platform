-- CreateEnum
CREATE TYPE "IntroductionTargetType" AS ENUM ('APPLICATION', 'INVESTOR_LISTING');

-- CreateEnum
CREATE TYPE "IntroductionStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "IntroductionRequest" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "targetType" "IntroductionTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "fee" DECIMAL(65,30) NOT NULL DEFAULT 15,
    "status" "IntroductionStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "IntroductionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IntroductionRequest_requesterId_idx" ON "IntroductionRequest"("requesterId");

-- CreateIndex
CREATE INDEX "IntroductionRequest_targetUserId_idx" ON "IntroductionRequest"("targetUserId");

-- AddForeignKey
ALTER TABLE "IntroductionRequest" ADD CONSTRAINT "IntroductionRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntroductionRequest" ADD CONSTRAINT "IntroductionRequest_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
