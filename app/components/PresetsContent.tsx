"use client";

import { useQuery } from "@tanstack/react-query";
import { PresetCard } from "@/app/components/PresetCard";
import { useAuth } from "@clerk/nextjs";
import { type Preset as PresetType } from "@/types/PresetTypes";
import { SearchFilters } from "@/app/components/SearchSidebar";
import { PresetPackCard } from "@/app/components/PresetPackCard";

interface PresetsContentProps {
  type: "uploaded" | "downloaded";
  filters: SearchFilters;
  contentType?: "presets" | "packs";
}

export default function PresetsContent({
  type,
  filters,
  contentType = "presets",
}: PresetsContentProps) {
  const { userId } = useAuth();

  const queryFn = async () => {
    const params = new URLSearchParams();
    params.append("type", type);
    params.append("contentType", contentType);

    if (!filters.showAll) {
      if (filters.genres.length > 0) {
        params.append("genres", filters.genres.join(","));
      }
      if (filters.vsts.length > 0) {
        params.append("vsts", filters.vsts.join(","));
      }
      if (filters.presetTypes.length > 0) {
        params.append("presetTypes", filters.presetTypes.join(","));
      }
    }

    const response = await fetch(`/api/presets?${params.toString()}`);

    if (!response.ok) {
      console.error("API Response Error:", await response.text());
      throw new Error("Failed to fetch presets");
    }

    return response.json();
  };

  const {
    data: items,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userContent", type, contentType, filters],
    queryFn,
    enabled: !!userId,
  });

  if (!userId) {
    return <div>Please sign in to view your content.</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading content</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-auto w-full overflow-auto min-h-[1000px]">
      {items?.map((item: any) =>
        contentType === "packs" ? (
          <PresetPackCard key={item.id} pack={item} isOwner={true} />
        ) : (
          <PresetCard key={item.id} preset={item} />
        )
      )}
    </div>
  );
}
