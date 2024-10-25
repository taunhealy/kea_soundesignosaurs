/*
  Warnings:

  - You are about to drop the column `googleCalendarLink` on the `Photographer` table. All the data in the column will be lost.
  - You are about to drop the column `selectedImages` on the `Photographer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Photographer" DROP COLUMN "googleCalendarLink",
DROP COLUMN "selectedImages";

-- CreateTable
CREATE TABLE "PortfolioImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "photographerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PortfolioImage_photographerId_idx" ON "PortfolioImage"("photographerId");

-- AddForeignKey
ALTER TABLE "PortfolioImage" ADD CONSTRAINT "PortfolioImage_photographerId_fkey" FOREIGN KEY ("photographerId") REFERENCES "Photographer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
