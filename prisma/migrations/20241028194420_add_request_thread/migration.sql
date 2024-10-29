/*
  Warnings:

  - You are about to drop the `HelpSubmission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HelpThread` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "HelpSubmission" DROP CONSTRAINT "HelpSubmission_helpThreadId_fkey";

-- DropTable
DROP TABLE "HelpSubmission";

-- DropTable
DROP TABLE "HelpThread";

-- CreateTable
CREATE TABLE "RequestThread" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "youtubeLink" TEXT,
    "genre" TEXT NOT NULL,
    "enquiryDetails" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestSubmission" (
    "id" TEXT NOT NULL,
    "requestThreadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "soundPreviewUrl" TEXT,
    "presetFileUrl" TEXT,
    "guide" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RequestSubmission_requestThreadId_idx" ON "RequestSubmission"("requestThreadId");

-- CreateIndex
CREATE INDEX "RequestSubmission_userId_idx" ON "RequestSubmission"("userId");

-- AddForeignKey
ALTER TABLE "RequestThread" ADD CONSTRAINT "RequestThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "SoundDesigner"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestSubmission" ADD CONSTRAINT "RequestSubmission_requestThreadId_fkey" FOREIGN KEY ("requestThreadId") REFERENCES "RequestThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestSubmission" ADD CONSTRAINT "RequestSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "SoundDesigner"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
