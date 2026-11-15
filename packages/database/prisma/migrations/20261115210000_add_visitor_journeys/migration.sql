-- AlterTable
ALTER TABLE "PageView" ADD COLUMN     "browser" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "deviceType" TEXT,
ADD COLUMN     "durationMs" INTEGER,
ADD COLUMN     "os" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "screenWidth" INTEGER,
ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "userId" TEXT,
ADD COLUMN     "utmSource" TEXT;

-- CreateTable
CREATE TABLE "TrackEvent" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT,
    "sessionId" TEXT,
    "pageViewId" TEXT,
    "path" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "target" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageView_sessionId_idx" ON "PageView"("sessionId");

-- CreateIndex
CREATE INDEX "TrackEvent_sessionId_idx" ON "TrackEvent"("sessionId");

-- CreateIndex
CREATE INDEX "TrackEvent_createdAt_idx" ON "TrackEvent"("createdAt");
