"use client";

import { useState } from "react";
import { SearchSidebar } from "@/app/components/SearchSidebar";
import { ExploreGrid } from "@/app/components/ExploreGrid";
import { CategoryTabs } from "@/app/components/CategoryTabs";
import { SearchFilters } from "@/app/components/SearchSidebar";

export default function HomePage() {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    genres: [],
    vsts: [],
    presetTypes: [],
    tags: [],
    category: "",
    showAll: false,
    types: [],
  });

  return (
    <div className="flex">
      <SearchSidebar filters={filters} setFilters={setFilters} />
      <div className="flex-1">
        <CategoryTabs filters={filters} setFilters={setFilters} />
        <ExploreGrid filters={filters} />
      </div>
    </div>
  );
}
