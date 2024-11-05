import { useQuery } from "@tanstack/react-query";
import { QueryParams, QueryConfig } from "@/types/QueryTypes";
import { queryKeys } from "@/lib/queries";

export function usePresets(params: QueryParams, config?: QueryConfig) {
  const queryString = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        queryString.append(key, value.join(","));
      } else {
        queryString.append(key, String(value));
      }
    }
  });

  return useQuery({
    queryKey: queryKeys.presets.list(queryString.toString()),
    queryFn: async () => {
      const response = await fetch(`/api/presets?${queryString.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch presets");
      }
      return response.json();
    },
    ...config,
  });
}
