"use client";

import { ContentExplorer } from "@/app/components/ContentExplorer";
import { ContentType } from "@prisma/client";
import { useSearchParams } from "next/navigation";
import { DEFAULT_FILTERS } from "@/utils/filterUtils";
import { SearchFilters } from "@/types/SearchTypes";
import { RequestViewMode } from "@/types/enums";
import { RequestStatus } from "@/types/enums";

export default function RequestsPage() {
  const searchParams = useSearchParams();

  // Parse URL params into filters
  const initialFilters: SearchFilters = {
    ...DEFAULT_FILTERS,
    q: searchParams.get("searchTerm") || "",
    genres: searchParams.get("genres")?.split(",") || [],
    status: searchParams.get("status") || RequestStatus.OPEN,
    p: parseInt(searchParams.get("page") || "1"),
    type: ContentType.REQUESTS,
    view:
      (searchParams.get("view") as RequestViewMode) || RequestViewMode.PUBLIC,
  };

  return (
    <ContentExplorer
      contentType={ContentType.REQUESTS}
      initialFilters={initialFilters}
    />
  );
}
