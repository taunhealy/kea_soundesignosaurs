import { useQuery } from "@tanstack/react-query";
import { SearchFilters } from "@/types/SearchTypes";
import { queryKeys } from "@/lib/queries";

export function usePresets(filters: SearchFilters | undefined) {
  const queryString = new URLSearchParams();

  // Add search filters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          queryString.append(key, value.join(","));
        } else {
          queryString.append(key, String(value));
        }
      }
    });
  }

  return useQuery({
    queryKey: ["presets", queryString.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/search?${queryString.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch presets");
      }
      return response.json();
    },
  });
}

// For fetching single preset details
export function usePresetDetails(id: string) {
  return useQuery({
    queryKey: queryKeys.presets.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/presets/${id}`);
      if (!response.ok) throw new Error("Failed to fetch preset");
      return response.json();
    },
    enabled: !!id,
  });
}
