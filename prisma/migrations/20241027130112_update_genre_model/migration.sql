/*
  Warnings:

  - You are about to drop the column `fxGuide` on the `Preset` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Genre` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `Genre` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guide` to the `Preset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `presetType` to the `Preset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vstType` to the `Preset` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GenreType" AS ENUM ('ELECTRONIC', 'HIP_HOP', 'ROCK', 'METAL', 'HARDWAVE', 'WAVE', 'PHONK', 'FUTURE_BASS', 'COLOR_BASS', 'HOUSE', 'TECHNO', 'TRANCE', 'DUBSTEP', 'DRUM_AND_BASS', 'DRILL', 'AMAPIANO', 'TRAP', 'AMBIENT', 'SYNTHWAVE', 'EXPERIMENTAL', 'IDM', 'BREAKBEAT', 'GLITCH_HOP', 'DOWNTEMPO', 'LO_FI');

-- CreateEnum
CREATE TYPE "VSTType" AS ENUM ('SERUM', 'VITAL');

-- AlterTable
ALTER TABLE "Genre" ADD COLUMN     "type" "GenreType" NOT NULL;

-- AlterTable
ALTER TABLE "Preset" DROP COLUMN "fxGuide",
ADD COLUMN     "guide" TEXT NOT NULL,
ADD COLUMN     "presetType" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "vstType" "VSTType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");
