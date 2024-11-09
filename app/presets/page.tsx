"use client";

import { ContentExplorer } from "@/app/components/ContentExplorer";
import { BoardView } from "@/types/enums";
import { ContentType } from "@prisma/client";
import { useSearchParams, useRouter } from "next/navigation";
import { DEFAULT_FILTERS } from "@/utils/filterUtils";
import { SearchFilters } from "@/types/SearchTypes";
import { PresetType, PriceType } from "@prisma/client";
import { ContentViewMode } from "@/types/enums";

export default function PresetsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse URL params into filters
  const initialFilters: SearchFilters = {
    ...DEFAULT_FILTERS,
    q: searchParams.get("searchTerm") || "",
    preset: (searchParams.get("presetTypes")?.split(",") as PresetType[]) || [],
    genres: searchParams.get("genres")?.split(",") || [],
    vst: searchParams.get("vstTypes")?.split(",") || [],
    price: (searchParams.get("priceTypes")?.split(",") as PriceType[]) || [],
    p: parseInt(searchParams.get("page") || "1"),
    type: ContentType.PRESETS,
    view:
      (searchParams.get("view") as ContentViewMode) || ContentViewMode.EXPLORE,
  };

  return (
    <ContentExplorer
      contentType={ContentType.PRESETS}
      boardView={BoardView.PUBLIC}
      initialFilters={initialFilters}
    />
  );
}
