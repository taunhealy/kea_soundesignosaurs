/*
  Warnings:

  - You are about to drop the `Preset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RequestSubmission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RequestThread` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PresetType" AS ENUM ('PAD', 'LEAD', 'PLUCK', 'BASS', 'FX', 'OTHER');

-- DropForeignKey
ALTER TABLE "Download" DROP CONSTRAINT "Download_presetId_fkey";

-- DropForeignKey
ALTER TABLE "Preset" DROP CONSTRAINT "Preset_genreId_fkey";

-- DropForeignKey
ALTER TABLE "Preset" DROP CONSTRAINT "Preset_soundDesignerId_fkey";

-- DropForeignKey
ALTER TABLE "Preset" DROP CONSTRAINT "Preset_vstId_fkey";

-- DropForeignKey
ALTER TABLE "RequestSubmission" DROP CONSTRAINT "RequestSubmission_requestThreadId_fkey";

-- DropForeignKey
ALTER TABLE "RequestSubmission" DROP CONSTRAINT "RequestSubmission_userId_fkey";

-- DropForeignKey
ALTER TABLE "RequestThread" DROP CONSTRAINT "RequestThread_userId_fkey";

-- DropTable
DROP TABLE "Preset";

-- DropTable
DROP TABLE "RequestSubmission";

-- DropTable
DROP TABLE "RequestThread";

-- CreateTable
CREATE TABLE "PresetUpload" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "presetType" "PresetType" NOT NULL,
    "soundPreviewUrl" TEXT,
    "presetFileUrl" TEXT,
    "price" DOUBLE PRECISION,
    "spotifyLink" TEXT,
    "genreId" TEXT NOT NULL,
    "soundDesignerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "presetRequestId" TEXT,
    "vstId" TEXT NOT NULL,
    "guide" TEXT,
    "tags" TEXT[],

    CONSTRAINT "PresetUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresetRequest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "youtubeLink" TEXT,
    "genre" TEXT NOT NULL,
    "enquiryDetails" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'OPEN',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tags" TEXT[],

    CONSTRAINT "PresetRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresetSubmission" (
    "id" TEXT NOT NULL,
    "presetRequestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "soundPreviewUrl" TEXT,
    "presetFileUrl" TEXT,
    "guide" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tags" TEXT[],

    CONSTRAINT "PresetSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PresetRequest_userId_idx" ON "PresetRequest"("userId");

-- CreateIndex
CREATE INDEX "PresetSubmission_presetRequestId_idx" ON "PresetSubmission"("presetRequestId");

-- CreateIndex
CREATE INDEX "PresetSubmission_userId_idx" ON "PresetSubmission"("userId");

-- AddForeignKey
ALTER TABLE "PresetUpload" ADD CONSTRAINT "PresetUpload_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetUpload" ADD CONSTRAINT "PresetUpload_soundDesignerId_fkey" FOREIGN KEY ("soundDesignerId") REFERENCES "SoundDesigner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetUpload" ADD CONSTRAINT "PresetUpload_presetRequestId_fkey" FOREIGN KEY ("presetRequestId") REFERENCES "PresetRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetUpload" ADD CONSTRAINT "PresetUpload_vstId_fkey" FOREIGN KEY ("vstId") REFERENCES "VST"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetRequest" ADD CONSTRAINT "PresetRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "SoundDesigner"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "PresetUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetSubmission" ADD CONSTRAINT "PresetSubmission_presetRequestId_fkey" FOREIGN KEY ("presetRequestId") REFERENCES "PresetRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetSubmission" ADD CONSTRAINT "PresetSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "SoundDesigner"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
