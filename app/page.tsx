"use client";

import { useState } from "react";
import { SearchSidebar } from "@/app/components/SearchSidebar";
import { SearchFilters } from "@/types/SearchTypes";
import { ContentType } from "@prisma/client";
import { ContentExplorer } from "@/app/components/ContentExplorer";
import { useSearch } from "@/contexts/SearchContext";
import { CategoryTabs } from "@/app/components/CategoryTabs";

export default function HomePage() {
  const { filters, updateFilter } = useSearch();
  const showContentTypeSwitch = filters.displayMode === "browse";

  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryTabs
        filters={filters}
        setFilters={(newFilters) => {
          Object.entries(newFilters).forEach(([key, value]) => {
            updateFilter(key as keyof SearchFilters, value);
          });
        }}
      />
      <div className="flex gap-6">
        <SearchSidebar />
        <div className="flex-1">
          {showContentTypeSwitch && (
            <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground mb-4">
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
          )}
          <ContentExplorer mode="explore" />
        </div>
      </div>
    </div>
  );
}
