import { useMutation, useQuery } from "@tanstack/react-query";
import { QueryParams, QueryConfig } from "@/types/QueryTypes";
import { queryKeys, queryClient } from "@/lib/queries";

export function usePresetsList(params: QueryParams, config?: QueryConfig) {
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
    queryKey: ["presets", params],
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

export function useDeletePreset() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/presets/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete preset");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.presets.lists() });
    },
  });
}
