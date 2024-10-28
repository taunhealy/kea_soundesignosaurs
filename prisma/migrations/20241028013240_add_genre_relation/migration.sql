/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Genre` table. All the data in the column will be lost.
  - You are about to drop the column `isCustom` on the `Genre` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Genre` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Genre` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Preset` table. All the data in the column will be lost.
  - You are about to drop the column `fullDemoUrl` on the `Preset` table. All the data in the column will be lost.
  - You are about to drop the column `genre` on the `Preset` table. All the data in the column will be lost.
  - You are about to drop the column `guide` on the `Preset` table. All the data in the column will be lost.
  - You are about to drop the column `vstType` on the `Preset` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Genre_name_key";

-- AlterTable
ALTER TABLE "Genre" DROP COLUMN "createdAt",
DROP COLUMN "isCustom",
DROP COLUMN "type",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Preset" DROP COLUMN "description",
DROP COLUMN "fullDemoUrl",
DROP COLUMN "genre",
DROP COLUMN "guide",
DROP COLUMN "vstType",
ADD COLUMN     "genreId" TEXT;

-- AddForeignKey
ALTER TABLE "Preset" ADD CONSTRAINT "Preset_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE SET NULL ON UPDATE CASCADE;
