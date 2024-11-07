"use client";

import { PresetGrid } from "@/app/components/shared/PresetGrid";
import { SearchSidebar } from "@/app/components/SearchSidebar";
import { PresetPackGrid } from "@/app/components/shared/PresetPackGrid";
import { PresetRequestGrid } from "@/app/components/shared/PresetRequestGrid";
import { usePresets } from "@/app/hooks/queries/usePresets";
import { usePresetPacks } from "@/app/hooks/queries/usePresetPacks";
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

  // Use specific hooks based on content type
  const { data: presets, isLoading: presetsLoading } = usePresets(filters);
  const { data: packs, isLoading: packsLoading } = usePresetPacks(filters);

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      contentType,
    }));
  };

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      contentType,
    }));
  }, [contentType]);

  const renderContent = () => {
    switch (contentType) {
      case ContentType.PRESETS:
        return (
          <PresetGrid
            presets={presets}
            viewMode="explore"
            isLoading={presetsLoading}
          />
        );
      case ContentType.PACKS:
        return (
          <PresetPackGrid
            packs={packs ?? []}
            type="explore"
            isLoading={packsLoading}
          />
        );
      case ContentType.REQUESTS:
        return <PresetRequestGrid />;
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
