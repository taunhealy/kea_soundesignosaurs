import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { ContentType, Genre, SoundDesigner, VST } from "@prisma/client";
import { SearchFilters } from "@/types/SearchTypes";
import { BoardView } from "@/types/enums";
import { PresetUpload, PresetPackUpload, PresetRequest } from "@prisma/client";
import { PresetPackWithRelations } from "@/types/presetPack";
import { PresetRequestWithRelations } from "@/types/PresetRequestTypes";

interface UseContentProps {
  contentType: ContentType;
  boardView: BoardView;
  filters: SearchFilters;
  view?: string | null;
  status?: string | null;
}

type ContentTypeMap = {
  [ContentType.PRESETS]: PresetUpload & {
    vst?: VST | null;
    genre?: Genre | null;
    soundDesigner?: SoundDesigner | null;
  };
  [ContentType.PACKS]: PresetPackWithRelations;
  [ContentType.REQUESTS]: PresetRequestWithRelations;
};

export function useContent({
  contentType,
  boardView,
  filters,
  view,
  status,
}: UseContentProps) {
  const isDashboard = boardView === BoardView.DASHBOARD;

  // @ts-ignore
  const { data, isLoading } = useQuery({
    queryKey: [contentType.toLowerCase(), filters, view, isDashboard, status],
    queryFn: async () => {
      if (isDashboard && view) {
        // Dashboard view - use specific endpoints
        switch (contentType) {
          case ContentType.PRESETS:
            const presetsResponse = await fetch(`/api/presets?type=${view}`);
            return presetsResponse.json();

          case ContentType.PACKS:
            const packsResponse = await fetch(
              `/api/presetPacks?userStatus=${view}`
            );
            return packsResponse.json();

          case ContentType.REQUESTS:
            const requestsResponse = await fetch(
              `/api/presetRequests?userStatus=${view}`
            );
            return requestsResponse.json();

          default:
            throw new Error(`Unsupported content type: ${contentType}`);
        }
      } else {
        // Public view - use search endpoint
        const searchParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            searchParams.set(
              key,
              Array.isArray(value) ? value.join(",") : String(value)
            );
          }
        });
        searchParams.set("type", contentType.toLowerCase());
        if (status) searchParams.set("status", status);

        const response = await fetch(`/api/search?${searchParams}`);
        const result = await response.json();
        console.log("Search API response:", result);
        return result;
      }
    },
  });

  console.log("useContent hook data:", data);

  return {
    items: Array.isArray(data) ? data : [],
    isLoading,
  };
}
