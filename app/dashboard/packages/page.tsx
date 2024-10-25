import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PackageList from "@/app/components/PackageList";
import AddPackageButton from "@/app/components/AddPackageButton";
import { Suspense } from "react";
import { PhotoPackage } from "@/types/PhotoPackage";

async function getPackages(userId: string) {
  const packages = await prisma.package.findMany({
    where: {
      photographer: {
        userId: userId,
      },
    },
    select: {
      id: true,
      title: true,
      price: true,
      editedPhotos: true,
      shootingHours: true,
      turnaroundDays: true,
      photographerId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return packages;
}

export default async function PackagesPage() {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const packages = await getPackages(userId);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your Packages</h1>
      <AddPackageButton />
      <Suspense fallback={<div>Loading packages...</div>}>
        <PackageList packages={packages as PhotoPackage[]} />
      </Suspense>
    </div>
  );
}
