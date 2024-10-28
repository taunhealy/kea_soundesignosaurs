-- DropIndex
DROP INDEX "HelpThread_userId_idx";

-- CreateTable
CREATE TABLE "HelpSubmission" (
    "id" TEXT NOT NULL,
    "helpThreadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "soundPreviewUrl" TEXT,
    "presetFileUrl" TEXT,
    "guide" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelpSubmission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HelpSubmission" ADD CONSTRAINT "HelpSubmission_helpThreadId_fkey" FOREIGN KEY ("helpThreadId") REFERENCES "HelpThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
