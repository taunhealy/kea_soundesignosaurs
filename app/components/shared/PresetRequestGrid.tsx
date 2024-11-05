"use client";

import { useQuery } from "@tanstack/react-query";
import { PresetRequestCard } from "@/app/components/dashboard/PresetRequestCard";
import { Skeleton } from "@/app/components/ui/skeleton";
import type { SearchFilters } from "@/types/SearchTypes";
import type { PresetRequest } from "@/types/PresetRequestTypes";

interface PresetRequestGridProps {
  filters: SearchFilters;
}

export function PresetRequestGrid({ filters }: PresetRequestGridProps) {
  const { data: requests, isLoading } = useQuery({
    queryKey: ["presetRequests", filters],
    queryFn: async () => {
      const response = await fetch("/api/presetRequests");
      if (!response.ok) throw new Error("Failed to fetch requests");
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
        No preset requests found
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      {requests.map((request: PresetRequest) => (
        <PresetRequestCard
          key={request.id}
          request={request}
          type="requested"
          showSubmissions={false}
        />
      ))}
    </div>
  );
}
