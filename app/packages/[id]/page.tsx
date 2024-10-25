import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import PortfolioGrid from "@/app/components/dashboard/PortfolioGrid";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";

async function getPackage(id: string) {
  const packageData = await prisma.package.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      price: true,
      editedPhotos: true,
      shootingHours: true,
      turnaroundDays: true,
      photographer: {
        select: {
          id: true,
          name: true,
          profileImage: true,
          portfolioImages: {
            select: {
              id: true,
              url: true,
            },
          },
        },
      },
    },
  });

  if (!packageData) {
    notFound();
  }

  return packageData;
}

export default async function PackageDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const packageData = await getPackage(params.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-4">{packageData.title}</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Package Details
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Price</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                ${packageData.price}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Edited Photos
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {packageData.editedPhotos}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Shooting Hours
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {packageData.shootingHours}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Turnaround Days
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {packageData.turnaroundDays}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
            </div>
          </dl>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Photographer</h2>
        <div className="flex items-center mb-4">
          {packageData.photographer.profileImage && (
            <img
              src={packageData.photographer.profileImage}
              alt={packageData.photographer.name}
              className="w-16 h-16 rounded-full mr-4"
            />
          )}
          <div>
            <h3 className="text-xl font-semibold">
              {packageData.photographer.name}
            </h3>
            <Button asChild className="mt-2">
              <Link href={`/photographer/${packageData.photographer.id}`}>
                View Profile
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Photographer's Portfolio
        </h2>
        <PortfolioGrid images={packageData.photographer.portfolioImages} />
      </div>

      <div className="mt-8">
        <Button asChild className="w-full">
          <Link href={`/packages/${packageData.id}/book`}>
            Book This Package
          </Link>
        </Button>
      </div>
    </div>
  );
}
