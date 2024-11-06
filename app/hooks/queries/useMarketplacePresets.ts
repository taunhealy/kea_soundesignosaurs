import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { SearchFilters } from "@/types/SearchTypes";

export function useMarketplacePresets() {
  const searchFilters = useSelector(
    (state: { search: { filters: SearchFilters } }) => state.search.filters
  );

  const queryString = new URLSearchParams();

  // Add search filters from Redux store
  Object.entries(searchFilters).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        queryString.append(key, value.join(","));
      } else {
        queryString.append(key, String(value));
      }
    }
  });

  return useQuery({
    queryKey: ["marketplace-presets", queryString.toString()],
    queryFn: async () => {
      const response = await fetch(
        `/api/marketplace/presets?${queryString.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch marketplace presets");
      }
      return response.json();
    },
  });
}
