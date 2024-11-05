import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { SearchFilters } from "@/types/SearchTypes";

export function usePresetPacks(filters: SearchFilters) {
  const queryString = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        queryString.append(key, value.join(","));
      } else {
        queryString.append(key, String(value));
      }
    }
  });

  return useQuery({
    queryKey: queryKeys.packs.list(queryString.toString()),
    queryFn: async () => {
      const response = await fetch(`/api/presetPacks?${queryString.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch preset packs");
      }
      return response.json();
    },
  });
}
