"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PresetCard } from "./PresetCard";

interface ExploreItem {
  id: string;
  name: string;
  description: string;
  settings: {
    price: number;
    soundPreviewUrl: string;
    downloadUrl?: string;
  };
  type: "preset";
  soundDesigner: {
    name: string;
    profileImage: string;
  };
  genre: {
    name: string;
  };
  vst?: {
    name: string;
  };
}

interface ExploreGridProps {
  filters: {
    searchTerm: string;
    genres: string[];
    vsts: string[];
    presetTypes: string[];
  };
}

export function ExploreGrid({ filters }: ExploreGridProps) {
  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery<ExploreItem[]>({
    queryKey: [
      "exploreItems",
      filters.searchTerm,
      filters.genres,
      filters.vsts,
      filters.presetTypes,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.searchTerm) params.append("q", filters.searchTerm);
      if (filters.genres.length)
        params.append("genre", filters.genres.join(","));
      if (filters.vsts.length) params.append("vst", filters.vsts.join(","));
      if (filters.presetTypes.length)
        params.append("presetTypes", filters.presetTypes.join(","));

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
            <PresetCard key={item.id} preset={item} />
          ))}
        </div>
      )}
    </div>
  );
}
