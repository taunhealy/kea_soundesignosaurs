"use client";

import { useQuery } from "@tanstack/react-query";
import { PresetCard } from "@/app/components/PresetCard";
import { useAuth } from "@clerk/nextjs";
import { type Preset as PresetType } from "@/types/PresetTypes";
import { SearchFilters } from "@/app/components/SearchSidebar";

interface PresetsContentProps {
  type: "uploaded" | "downloaded";
  filters: SearchFilters;
  contentType?: "presets" | "packs";
}

export function PresetsContent({
  type,
  filters,
  contentType = "presets",
}: PresetsContentProps) {
  const { userId } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["presets", type, filters, contentType],
    queryFn: async () => {
      if (type === "downloaded") {
        const response = await fetch("/api/downloads");
        if (!response.ok) throw new Error("Failed to fetch downloads");
        return response.json();
      } else {
        const queryParams: Record<string, string> = {
          type,
          contentType,
        };

        // Convert array values to comma-separated strings
        Object.entries(filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            queryParams[key] = value.join(",");
          } else {
            queryParams[key] = String(value);
          }
        });

        const queryString = new URLSearchParams(queryParams).toString();
        const response = await fetch(`/api/presets?${queryString}`);
        if (!response.ok) throw new Error("Failed to fetch presets");
        return response.json();
      }
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data?.map((item: any) => {
        if (type === "downloaded") {
          const downloadedItem = item.preset || item.pack;
          if (!downloadedItem) return null;

          return (
            <PresetCard
              key={`${item.preset ? "preset" : "pack"}-${downloadedItem.id}`}
              preset={downloadedItem}
              type="downloaded"
            />
          );
        } else {
          return <PresetCard key={item.id} preset={item} type="uploaded" />;
        }
      })}
    </div>
  );
}
