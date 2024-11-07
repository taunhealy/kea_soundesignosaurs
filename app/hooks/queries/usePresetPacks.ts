import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { PresetPackWithRelations } from "@/types/presetPack";
import { SearchFilters } from "@/types/SearchTypes";

export function usePresetPacks(filters: SearchFilters | undefined) {
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

  return useQuery<PresetPackWithRelations[]>({
    queryKey: ["packs", queryString.toString()],
    queryFn: async () => {
      const response = await fetch(
        `/api/search?${queryString.toString()}&type=packs`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch preset packs");
      }
      const data = await response.json();

      return data.map((pack: any) => ({
        ...pack,
        presets: pack.presets || [],
        soundDesigner: pack.soundDesigner || null,
      }));
    },
  });
}
