-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userType" TEXT;

-- CreateTable
CREATE TABLE "PackageClick" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "packageId" TEXT NOT NULL,

    CONSTRAINT "PackageClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsiteClick" (
    "id" TEXT NOT NULL,
    "photographerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebsiteClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PackageClick_packageId_idx" ON "PackageClick"("packageId");

-- AddForeignKey
ALTER TABLE "PackageClick" ADD CONSTRAINT "PackageClick_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebsiteClick" ADD CONSTRAINT "WebsiteClick_photographerId_fkey" FOREIGN KEY ("photographerId") REFERENCES "Photographer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
