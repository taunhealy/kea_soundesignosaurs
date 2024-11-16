// app/hooks/usePresetSearch.ts
import { useQuery } from "@tanstack/react-query";
import { SearchFilters } from "@/types/SearchTypes";
import { queryKeys } from "@/lib/queries";

export function usePresetSearch(filters: SearchFilters) {
  return useQuery({
    queryKey: ["content", filters.itemType, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.itemType) params.set("itemType", filters.itemType.toString());
      if (filters.searchTerm) params.set("searchTerm", filters.searchTerm);
      if (filters.view) params.set("view", filters.view.toString());

      const response = await fetch(`/api/search?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch presets");
      }
      const data = await response.json();
      return data;
    },
  });
}
