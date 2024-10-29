import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "./useDebounce";

export function useSearch(searchTerm: string, filters: any) {
  const debouncedSearch = useDebounce(searchTerm, 300);

  return useQuery({
    queryKey: ["search", debouncedSearch, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("q", debouncedSearch);
      if (filters.genre) params.append("genre", filters.genre);
      if (filters.vst) params.append("vst", filters.vst);
      if (filters.presetType) params.append("presetType", filters.presetType);

      const response = await fetch(`/api/search?${params.toString()}`);
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
    enabled: debouncedSearch.length > 0,
  });
}
