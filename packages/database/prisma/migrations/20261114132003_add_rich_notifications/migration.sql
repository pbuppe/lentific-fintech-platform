-- AlterTable
ALTER TABLE "DocumentRequest" ADD COLUMN     "dueAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "body" TEXT,
ADD COLUMN     "kind" TEXT,
ADD COLUMN     "link" TEXT,
ADD COLUMN     "refId" TEXT,
ADD COLUMN     "senderId" TEXT,
ADD COLUMN     "title" TEXT;

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_senderId_idx" ON "Notification"("senderId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
