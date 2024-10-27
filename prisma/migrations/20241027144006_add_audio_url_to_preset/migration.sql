/*
  Warnings:

  - You are about to drop the column `sampleId` on the `Download` table. All the data in the column will be lost.
  - You are about to drop the `Sample` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Download" DROP CONSTRAINT "Download_sampleId_fkey";

-- DropForeignKey
ALTER TABLE "Sample" DROP CONSTRAINT "Sample_genreId_fkey";

-- DropForeignKey
ALTER TABLE "Sample" DROP CONSTRAINT "Sample_soundDesignerId_fkey";

-- AlterTable
ALTER TABLE "Download" DROP COLUMN "sampleId";

-- AlterTable
ALTER TABLE "Genre" ADD COLUMN     "isCustom" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Preset" ADD COLUMN     "audioUrl" TEXT;

-- DropTable
DROP TABLE "Sample";
