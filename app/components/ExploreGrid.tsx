"use client";

import { useState, useEffect } from "react";
import { PresetCard } from "./PresetCard";
import { SampleCard } from "./SampleCard";
import { useDebounce } from "../hooks/useDebounce";

interface ExploreItem {
  id: string;
  name: string;
  description: string;
  settings: {
    price: number;
    soundPreviewUrl: string;
    downloadUrl?: string;
  };
  type: "preset" | "sample";
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
  initialItems: ExploreItem[];
}

export function ExploreGrid({ initialItems }: ExploreGridProps) {
  const [items, setItems] = useState<ExploreItem[]>(initialItems || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchItems = async (filters: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/search?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch items");
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems({ q: debouncedSearchTerm });
  }, [debouncedSearchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  if (error) return <div>An error occurred: {error.message}</div>;

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search presets and samples..."
        className="w-full p-2 border border-gray-300 rounded"
      />
      {isLoading ? (
        <div>Loading...</div>
      ) : items && items.length === 0 ? (
        <div>No items found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items && items.map((item: ExploreItem) =>
            item.type === "preset" ? (
              <PresetCard key={item.id} preset={item} />
            ) : (
              <SampleCard key={item.id} sample={item} />
            )
          )}
        </div>
      )}
    </div>
  );
}
