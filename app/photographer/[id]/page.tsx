"use client";

import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Photographer } from "@/app/types";
import { RequestAvailabilityButton } from "@/app/components/RequestAvailabilityButton";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

async function fetchPhotographer(id: string): Promise<Photographer> {
  const response = await fetch(`/api/photographers/${id}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return {
    ...data,
    portfolioImages: data.portfolioImages || [],
  };
}

export default function PhotographerPage() {
  const { id } = useParams();

  const {
    data: photographer,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["photographer", id],
    queryFn: () => fetchPhotographer(id as string),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {(error as Error).message}</div>;
  if (!photographer) return <div>No photographer found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {photographer.profileImage ? (
            <Image
              src={photographer.profileImage}
              alt={photographer.name}
              width={400}
              height={400}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="w-[400px] h-[400px] bg-primary flex items-center justify-center text-white text-4xl font-bold rounded-lg">
              {photographer.name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{photographer.name}</h1>
          <p className="text-gray-600 mb-4">{photographer.location}</p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {photographer.portfolioImages &&
            photographer.portfolioImages.length > 0 ? (
              photographer.portfolioImages.map((image, index) => (
                <Image
                  key={image.id}
                  src={image.url}
                  alt={`Portfolio ${index + 1}`}
                  width={100}
                  height={100}
                  className="rounded-lg object-cover"
                />
              ))
            ) : (
              <p>No portfolio images available</p>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-4">Packages</h2>
          {photographer.packages.map((pkg) => (
            <div key={pkg.id} className="mb-4">
              <h3 className="text-xl font-semibold">{pkg.title}</h3>
              <p>Price: ${pkg.price}</p>
              <p>Edited Photos: {pkg.editedPhotos}</p>
              <p>Shooting Hours: {pkg.shootingHours}</p>
              <p>Turnaround Days: {pkg.turnaroundDays}</p>
            </div>
          ))}
          <RequestAvailabilityButton photographerId={photographer.id} />
          <Button
            onClick={() => {
              navigator.clipboard.writeText(photographer.email);
              alert("Email copied to clipboard!");
            }}
          >
            Contact Photographer
          </Button>
        </div>
      </div>
    </div>
  );
}
