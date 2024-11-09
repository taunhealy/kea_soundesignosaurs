"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PresetForm } from "@/app/components/PresetForm";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { toast } from "react-toastify";

export default function EditPresetPage() {
  const params = useParams();
  const router = useRouter();
  const presetId = params?.id as string;

  const { data: presetData, isLoading } = useQuery({
    queryKey: ["preset", presetId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/presetUpload/${presetId}`);
        if (response.status === 404) {
          toast.error("Preset not found");
          router.push("/dashboard?category=presets");
          return null;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch preset");
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching preset:", error);
        toast.error("Error loading preset");
        router.push("/dashboard?category=presets");
        return null;
      }
    },
    retry: false // Don't retry on failure
  });

  if (isLoading) return <div>Loading...</div>;
  if (!presetData) return null; // Will redirect due to the queryFn

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/dashboard/presets">
        <Button variant="outline">← Back to Presets</Button>
      </Link>
      <h1 className="text-2xl font-bold my-4">Edit Preset</h1>
      <PresetForm initialData={presetData} presetId={presetId} />
    </div>
  );
}
