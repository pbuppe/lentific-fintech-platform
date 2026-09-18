-- AlterTable
ALTER TABLE "PageView" ADD COLUMN     "geoCountryCode" TEXT;

-- CreateIndex
CREATE INDEX "PageView_geoCountryCode_idx" ON "PageView"("geoCountryCode");
