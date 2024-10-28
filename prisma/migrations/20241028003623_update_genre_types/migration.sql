/*
  Warnings:

  - You are about to drop the column `genreId` on the `Preset` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Genre` table without a default value. This is not possible if the table is not empty.
  - Made the column `type` on table `Genre` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "GenreType" ADD VALUE 'CUSTOM';
ALTER TYPE "GenreType" ADD VALUE 'SYSTEM';

-- DropForeignKey
ALTER TABLE "Preset" DROP CONSTRAINT "Preset_genreId_fkey";

-- AlterTable
ALTER TABLE "Genre" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "type" SET NOT NULL;

-- AlterTable
ALTER TABLE "Preset" DROP COLUMN "genreId",
ADD COLUMN     "genre" TEXT;

-- CreateTable
CREATE TABLE "HelpThread" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "youtubeLink" TEXT,
    "genre" TEXT NOT NULL,
    "enquiryDetails" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpThread_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HelpThread_userId_idx" ON "HelpThread"("userId");
