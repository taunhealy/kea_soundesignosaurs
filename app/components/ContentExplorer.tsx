"use client";

import { PresetGrid } from "@/app/components/shared/PresetGrid";
import { SearchSidebar } from "@/app/components/SearchSidebar";
import { useMarketplaceContent } from "@/app/hooks/queries/useMarketplaceContent";
import { ContentType } from "@prisma/client";
import { useSearch } from "@/contexts/SearchContext";

interface ContentExplorerProps {
  mode: "explore";
  contentType: ContentType;
}

export function ContentExplorer({ mode, contentType }: ContentExplorerProps) {
  const { filters, setFilters } = useSearch();
  const { data: content, isLoading } = useMarketplaceContent({ contentType });

  return (
    <div className="flex min-w-full w-full gap-6 overflow-hidden">
      <div className="w-64 flex-shrink-0">
        <SearchSidebar filters={filters} setFilters={setFilters} />
      </div>
      <div className="flex-auto w-full">
        <PresetGrid presets={content} type="explore" isLoading={isLoading} />
      </div>
    </div>
  );
}
