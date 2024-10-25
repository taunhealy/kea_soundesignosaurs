/*
  Warnings:

  - The primary key for the `SoundDesigner` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Preset" DROP CONSTRAINT "Preset_soundDesignerId_fkey";

-- DropForeignKey
ALTER TABLE "Sample" DROP CONSTRAINT "Sample_soundDesignerId_fkey";

-- DropForeignKey
ALTER TABLE "Tutorial" DROP CONSTRAINT "Tutorial_soundDesignerId_fkey";

-- AlterTable
ALTER TABLE "Preset" ALTER COLUMN "soundDesignerId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Sample" ADD COLUMN     "downloadCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "soundDesignerId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "SoundDesigner" DROP CONSTRAINT "SoundDesigner_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "SoundDesigner_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "SoundDesigner_id_seq";

-- AlterTable
ALTER TABLE "Tutorial" ALTER COLUMN "soundDesignerId" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "Download" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "sampleId" TEXT,
    "presetId" TEXT,

    CONSTRAINT "Download_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Download_userId_presetId_idx" ON "Download"("userId", "presetId");

-- AddForeignKey
ALTER TABLE "Preset" ADD CONSTRAINT "Preset_soundDesignerId_fkey" FOREIGN KEY ("soundDesignerId") REFERENCES "SoundDesigner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sample" ADD CONSTRAINT "Sample_soundDesignerId_fkey" FOREIGN KEY ("soundDesignerId") REFERENCES "SoundDesigner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tutorial" ADD CONSTRAINT "Tutorial_soundDesignerId_fkey" FOREIGN KEY ("soundDesignerId") REFERENCES "SoundDesigner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "Preset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
