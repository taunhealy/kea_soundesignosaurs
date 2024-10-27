/*
  Warnings:

  - You are about to drop the column `audioUrl` on the `Preset` table. All the data in the column will be lost.
  - You are about to drop the column `downloadUrl` on the `Preset` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Preset" DROP CONSTRAINT "Preset_genreId_fkey";

-- AlterTable
ALTER TABLE "Preset" DROP COLUMN "audioUrl",
DROP COLUMN "downloadUrl",
ADD COLUMN     "fullDemoUrl" TEXT,
ALTER COLUMN "genreId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Preset" ADD CONSTRAINT "Preset_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE SET NULL ON UPDATE CASCADE;
