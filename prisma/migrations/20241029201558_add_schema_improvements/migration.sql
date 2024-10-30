/*
  Warnings:

  - You are about to alter the column `title` on the `PresetUpload` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- DropForeignKey
ALTER TABLE "PresetUpload" DROP CONSTRAINT "PresetUpload_genreId_fkey";

-- DropForeignKey
ALTER TABLE "PresetUpload" DROP CONSTRAINT "PresetUpload_soundDesignerId_fkey";

-- DropForeignKey
ALTER TABLE "PresetUpload" DROP CONSTRAINT "PresetUpload_vstId_fkey";

-- AlterTable
ALTER TABLE "PresetUpload" ALTER COLUMN "title" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "genreId" DROP NOT NULL,
ALTER COLUMN "soundDesignerId" DROP NOT NULL,
ALTER COLUMN "vstId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "PresetUpload_genreId_idx" ON "PresetUpload"("genreId");

-- CreateIndex
CREATE INDEX "PresetUpload_soundDesignerId_idx" ON "PresetUpload"("soundDesignerId");

-- CreateIndex
CREATE INDEX "PresetUpload_vstId_idx" ON "PresetUpload"("vstId");

-- CreateIndex
CREATE INDEX "PresetUpload_createdAt_idx" ON "PresetUpload"("createdAt");

-- AddForeignKey
ALTER TABLE "PresetUpload" ADD CONSTRAINT "PresetUpload_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetUpload" ADD CONSTRAINT "PresetUpload_soundDesignerId_fkey" FOREIGN KEY ("soundDesignerId") REFERENCES "SoundDesigner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetUpload" ADD CONSTRAINT "PresetUpload_vstId_fkey" FOREIGN KEY ("vstId") REFERENCES "VST"("id") ON DELETE SET NULL ON UPDATE CASCADE;
