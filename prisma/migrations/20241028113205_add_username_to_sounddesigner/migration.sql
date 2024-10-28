/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `SoundDesigner` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SoundDesigner" ADD COLUMN     "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SoundDesigner_username_key" ON "SoundDesigner"("username");
