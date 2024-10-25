/*
  Warnings:

  - You are about to drop the column `portfolioImages` on the `Photographer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Photographer" DROP COLUMN "portfolioImages",
ADD COLUMN     "selectedImages" TEXT[],
ALTER COLUMN "profileImage" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Seeker" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "weddingDate" TEXT,
    "budgetRange" TEXT,
    "weddingVenue" TEXT,

    CONSTRAINT "Seeker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityRequest" (
    "id" TEXT NOT NULL,
    "seekerId" TEXT NOT NULL,
    "photographerId" TEXT NOT NULL,
    "requestedDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilityRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Seeker_userId_key" ON "Seeker"("userId");
