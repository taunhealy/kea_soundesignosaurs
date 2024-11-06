"use client";

import { useState } from "react";
import { ExploreNavigation } from "@/app/components/explore/ExploreNavigation";
import { PresetGrid } from "@/app/components/shared/PresetGrid";
import { SearchSidebar } from "@/app/components/SearchSidebar";
import { ContentType } from "@prisma/client";
import { SearchFilters } from "@/types/SearchTypes";
import { useMarketplaceContent } from "@/app/hooks/queries/useMarketplaceContent";
import { SearchForm } from "@/app/components/SearchForm";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store/store";
import {
  updateFilters,
  clearAllFilters,
} from "@/app/store/features/filtersSlice";

export default function ExplorePage() {
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.filters);

  const { data: presets, isLoading } = useMarketplaceContent(filters);

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    dispatch(updateFilters(newFilters));
  };

  return (
    <div className="flex-col w-auto min-w-[1000px] container gap-5 px-4 py-8 overflow-hidden">
      <div className="flex justify-between items-center mb-6 min-w-full">
        <h1 className="text-2xl font-bold">Explore Presets</h1>
        <ExploreNavigation />
      </div>
      <div className="flex min-w-full w-full gap-6 overflow-hidden">
        <div className="w-64 flex-shrink-0">
          <SearchForm
            filters={filters}
            onFilterChange={handleFilterChange}
            onSubmit={handleFilterChange}
          />
          <SearchSidebar filters={filters} setFilters={handleFilterChange} />
        </div>
        <div className="flex-auto w-full">
          <PresetGrid presets={presets} type="explore" isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
