"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PresetForm } from "@/app/components/PresetForm";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";

export default function EditPresetPage() {
  const params = useParams();
  const presetId = params?.id as string;

  const { data: presetData, isLoading, error } = useQuery({
    queryKey: ["preset", presetId],
    queryFn: async () => {
      const response = await fetch(`/api/presetUpload/${presetId}`);
      if (!response.ok) {
        console.error("Error fetching preset:", response.statusText);
        throw new Error("Error fetching preset");
      }
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) {
    console.error("Error loading preset:", error);
    return <div>Error loading preset</div>;
  }

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