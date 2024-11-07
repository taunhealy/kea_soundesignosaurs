"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import { EditIcon } from "lucide-react";
import { PresetRequestCard } from "@/app/components/dashboard/PresetRequestCard";
import { type PresetRequest } from "@/types/PresetRequestTypes";

export default function RequestPage() {
  const params = useParams();
  const id = params?.id as string;

  const {
    data: request,
    isLoading,
    error,
  } = useQuery<PresetRequest>({
    queryKey: ["request", id],
    queryFn: async () => {
      const response = await fetch(`/api/presetRequest/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch request");
      }
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading request</div>;
  if (!request) return <div>Request not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Link href="/dashboard/presetRequests">
          <Button variant="outline">← Back to Requests</Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/dashboard/presetRequest/${id}/edit`}>
            <Button variant="outline">
              <EditIcon className="h-4 w-4 mr-2" />
              Edit Request
            </Button>
          </Link>
        </div>
      </div>

      <PresetRequestCard
        request={request}
        showSubmissions={true}
        type="requested"
      />
    </div>
  );
}
