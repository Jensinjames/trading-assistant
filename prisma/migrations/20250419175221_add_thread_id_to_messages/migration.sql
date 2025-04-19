-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "threadId" TEXT;

-- CreateIndex
CREATE INDEX "Message_threadId_createdAt_idx" ON "Message"("threadId", "createdAt");
