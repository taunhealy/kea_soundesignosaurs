"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PresetCard } from "./PresetCard";
import { RequestCard } from "./RequestCard";

import { SearchFilters } from "./SearchSidebar";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface ExploreGridProps {
  filters: SearchFilters;
  contentType?: "presets" | "packs";
}

export const ExploreGrid = ({ filters, contentType = "presets" }: ExploreGridProps) => {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const category = searchParams?.get("category") || "presets";

  // Prefetch the other category's data
  useEffect(() => {
    const otherCategory = category === "presets" ? "requests" : "presets";
    queryClient.prefetchQuery({
      queryKey: ["exploreItems", otherCategory],
      queryFn: () =>
        fetch(
          `/api/${
            otherCategory === "requests" ? "presetRequest" : "presetUpload"
          }`
        ).then((res) => res.json()),
    });
  }, [category, queryClient]);

  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "exploreItems",
      category,
      filters.searchTerm,
      filters.genres,
      filters.vsts,
      filters.presetTypes,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();

      // Add search term if present
      if (filters.searchTerm) {
        params.append("q", filters.searchTerm);
      }

      // Add filters only if they're not empty and showAll is false
      if (!filters.showAll) {
        if (filters.genres.length) {
          params.append("genres", filters.genres.join(","));
        }
        if (filters.vsts.length) {
          params.append("vsts", filters.vsts.join(","));
        }
        if (filters.presetTypes.length) {
          params.append("presetTypes", filters.presetTypes.join(","));
        }
      }

      const endpoint = category === "requests" ? "presetRequest" : "search";
      const response = await fetch(`/api/${endpoint}?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }
      return response.json();
    },
  });

  if (error) return <div>An error occurred: {error.message}</div>;

  return (
    <div className="flex-1 p-4">
      {isLoading ? (
        <div>Loading...</div>
      ) : items.length === 0 ? (
        <div>No items found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item: any) =>
            category === "requests" ? (
              <RequestCard key={item.id} request={item} type="requested" />
            ) : (
              <PresetCard
                key={item.id}
                preset={{
                  ...item,
                  soundDesigner: item.soundDesigner
                    ? {
                        ...item.soundDesigner,
                        profileImage:
                          item.soundDesigner.profileImage ||
                          "/default-profile.png",
                      }
                    : undefined,
                }}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};
