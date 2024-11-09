"use client";

import { ContentExplorer } from "@/app/components/ContentExplorer";
import { BoardView, ContentViewMode } from "@/types/enums";
import { ContentType } from "@prisma/client";
import { useSearchParams } from "next/navigation";
import { DEFAULT_FILTERS } from "@/utils/filterUtils";
import { SearchFilters } from "@/types/SearchTypes";

export default function PacksPage() {
  const searchParams = useSearchParams();

  const initialFilters: SearchFilters = {
    ...DEFAULT_FILTERS,
    q: searchParams.get("searchTerm") || "",
    genres: searchParams.get("genres")?.split(",") || [],
    p: parseInt(searchParams.get("page") || "1"),
    type: ContentType.PACKS,
    view:
      (searchParams.get("view") as ContentViewMode) || ContentViewMode.EXPLORE,
  };

  return (
    <ContentExplorer
      contentType={ContentType.PACKS}
      boardView={BoardView.PUBLIC}
      initialFilters={initialFilters}
    />
  );
}
