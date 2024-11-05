"use client";

import { useSearch } from "@/contexts/SearchContext";
import { PresetGrid } from "@/app/components/shared/PresetGrid";
import { PresetPackGrid } from "@/app/components/shared/PresetPackGrid";
import { PresetRequestGrid } from "@/app/components/shared/PresetRequestGrid";
import { SearchSidebar } from "@/app/components/SearchSidebar";
import { ContentType } from "@prisma/client";

interface ContentExplorerProps {
  mode: "explore" | "dashboard";
}

export function ContentExplorer({ mode }: ContentExplorerProps) {
  const { filters, updateFilter } = useSearch();

  return (
    <div className="flex-col w-full container gap-5 px-4 py-8">
      <div className="flex gap-6">
        <SearchSidebar />
        <div className="flex-1">
          <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
            <button
              onClick={() => updateFilter("contentType", ContentType.PRESETS)}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                filters.contentType === ContentType.PRESETS
                  ? "bg-background text-foreground shadow-sm"
                  : "hover:bg-background/50 hover:text-foreground"
              }`}
            >
              Presets
            </button>
            <button
              onClick={() => updateFilter("contentType", ContentType.PACKS)}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                filters.contentType === ContentType.PACKS
                  ? "bg-background text-foreground shadow-sm"
                  : "hover:bg-background/50 hover:text-foreground"
              }`}
            >
              Preset Packs
            </button>
          </div>

          <div className="mt-4">
            {filters.contentType === ContentType.PRESETS && <PresetGrid />}
            {filters.contentType === ContentType.PACKS && <PresetPackGrid />}
          </div>
        </div>
      </div>
    </div>
  );
}
