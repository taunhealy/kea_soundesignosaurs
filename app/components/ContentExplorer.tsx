"use client";

import { PresetGrid } from "@/app/components/shared/PresetGrid";
import { SearchSidebar } from "@/app/components/SearchSidebar";
import { PresetPackGrid } from "@/app/components/shared/PresetPackGrid";
import { PresetRequestGrid } from "@/app/components/shared/PresetRequestGrid";
import { useContent } from "@/app/hooks/queries/useContent";
import { ContentType } from "@prisma/client";
import { SearchFilters } from "@/types/SearchTypes";
import { useState, useEffect } from "react";
import { DEFAULT_FILTERS } from "@/utils/filterUtils";

interface ContentExplorerProps {
  mode: "explore";
  contentType: ContentType;
}

export function ContentExplorer({ mode, contentType }: ContentExplorerProps) {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const { data: content, isLoading } = useContent(contentType, filters);

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ 
      ...prev, 
      ...newFilters,
      contentType
    }));
  };

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      contentType
    }));
  }, [contentType]);

  const renderContent = () => {
    switch (contentType) {
      case ContentType.PRESETS:
        return (
          <PresetGrid
            presets={content}
            viewMode="explore"
            isLoading={isLoading}
          />
        );
      case ContentType.PACKS:
        return (
          <PresetPackGrid
            packs={content}
            type="explore"
            isLoading={isLoading}
          />
        );
      case ContentType.REQUESTS:
        return <PresetRequestGrid filters={filters} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-w-full w-full gap-6 overflow-hidden">
      <div className="w-64 flex-shrink-0">
        <SearchSidebar filters={filters} onSubmit={handleFilterChange} />
      </div>
      <div className="flex-auto w-full">{renderContent()}</div>
    </div>
  );
}
