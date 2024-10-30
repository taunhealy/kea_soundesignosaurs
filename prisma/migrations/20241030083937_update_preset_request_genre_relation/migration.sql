/*
  Warnings:

  - You are about to drop the column `genre` on the `PresetRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PresetRequest" DROP COLUMN "genre",
ADD COLUMN     "genreId" TEXT;

-- CreateIndex
CREATE INDEX "PresetRequest_genreId_idx" ON "PresetRequest"("genreId");

-- AddForeignKey
ALTER TABLE "PresetRequest" ADD CONSTRAINT "PresetRequest_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE SET NULL ON UPDATE CASCADE;
