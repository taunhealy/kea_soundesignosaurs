"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PresetCard } from "./PresetCard";
import { RequestCard } from "./RequestCard";

import { SearchFilters } from "./SearchSidebar";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface ExploreGridProps {
  filters: SearchFilters;
}

export const ExploreGrid = ({ filters }: ExploreGridProps) => {
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

      // Common filters for both categories
      if (filters.genres.length)
        params.append("genre", filters.genres.join(","));
      if (filters.vsts.length) params.append("vst", filters.vsts.join(","));
      if (filters.presetTypes.length)
        params.append("presetType", filters.presetTypes[0]);

      // Add search term if present
      if (filters.searchTerm) {
        params.append("q", filters.searchTerm);
      }

      // Choose endpoint based on category
      const endpoint =
        category === "requests"
          ? "presetRequest"
          : filters.searchTerm
          ? "search"
          : "presetUpload";

      const response = await fetch(`/api/${endpoint}?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch items:", errorData);
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
