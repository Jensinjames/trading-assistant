/*
  Warnings:

  - Added the required column `assistantId` to the `ChatThread` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatThread" ADD COLUMN     "assistantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "assistantId" TEXT;

-- CreateTable
CREATE TABLE "Assistant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "model" TEXT NOT NULL DEFAULT 'gpt-3.5-turbo',
    "systemPrompt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assistant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChatThread" ADD CONSTRAINT "ChatThread_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "Assistant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
