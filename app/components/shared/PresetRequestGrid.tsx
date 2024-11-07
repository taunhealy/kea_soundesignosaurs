"use client";

import { useQuery } from "@tanstack/react-query";
import { PresetRequestCard } from "@/app/components/dashboard/PresetRequestCard";
import { Skeleton } from "@/app/components/ui/skeleton";
import type { PresetRequest } from "@/types/PresetRequestTypes";

interface PresetRequestGridProps {
  type: "public" | "requested" | "assisted";
}

export function PresetRequestGrid({ type }: PresetRequestGridProps) {
  const { data: requests, isLoading } = useQuery({
    queryKey: ["presetRequests", type],
    queryFn: async () => {
      const response = await fetch(`/api/presetRequests?type=${type}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[DEBUG] API Error:", errorData);
        throw new Error("Failed to fetch requests");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[200px] w-full" />
        ))}
      </div>
    );
  }

  if (!requests?.length) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No {type} requests found
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      {requests.map((request: PresetRequest) => (
        <PresetRequestCard
          key={request.id}
          request={request}
          type={type === "public" ? "requested" : type}
          showSubmissions={false}
        />
      ))}
    </div>
  );
}
