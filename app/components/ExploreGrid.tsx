"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PresetCard } from "./PresetCard";
import { Preset } from "@/types/PresetTypes";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";

export function ExploreGrid() {
  const filters = useSelector((state: RootState) => state.filters);

  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery<Preset[]>({
    queryKey: [
      "exploreItems",
      filters.searchTerm,
      filters.genres,
      filters.vsts,
      filters.types,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.searchTerm) params.append("q", filters.searchTerm);
      if (filters.genres.length)
        params.append("genre", filters.genres.join(","));
      if (filters.vsts.length) params.append("vst", filters.vsts.join(","));
      if (filters.types.length) params.append("types", filters.types.join(","));

      const response = await fetch(`/api/search?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch items");
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
          {items.map((item) => (
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
          ))}
        </div>
      )}
    </div>
  );
}
