/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `VST` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `presetFileUrl` to the `Preset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Preset" ADD COLUMN     "presetFileUrl" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "VST_name_key" ON "VST"("name");
