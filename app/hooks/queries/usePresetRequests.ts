import { useQuery } from "@tanstack/react-query";
import { SearchFilters } from "@/types/SearchTypes";

export function usePresetRequests(filters: SearchFilters) {
  const queryString = new URLSearchParams();

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
    queryKey: ["presetRequests", queryString.toString()],
    queryFn: async () => {
      const response = await fetch(
        `/api/presetRequests?${queryString.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch preset requests");
      }
      return response.json();
    },
  });
}
