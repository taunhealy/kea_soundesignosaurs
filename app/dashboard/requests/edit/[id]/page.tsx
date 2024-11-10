"use client";

import { useQuery } from "@tanstack/react-query";
import { PresetRequestCard } from "@/app/components/dashboard/PresetRequestCard";
import { RequestForm } from "@/app/components/dashboard/RequestForm";

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditPresetRequestPage({ params }: PageProps) {
  const { data: initialData, isLoading } = useQuery({
    queryKey: ["presetRequest", params.id],
    queryFn: async () => {
      const response = await fetch(`/api/presetRequest/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch preset request");
      return response.json();
    },
  });

  if (isLoading || !initialData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <PresetRequestCard request={initialData} />
      <div className="mt-6">
        <RequestForm initialData={initialData} requestId={params.id} />
      </div>
    </div>
  );
}
