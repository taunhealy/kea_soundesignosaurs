"use client";

import { SearchSidebar } from "@/app/components/SearchSidebar";
import { ExploreGrid } from "@/app/components/ExploreGrid";
import { useState } from "react";

export default function HomePage() {
  const [filters, setFilters] = useState({
    searchTerm: "",
    genres: [] as string[],
    vsts: [] as string[],
    presetTypes: [] as string[],
  });

  return (
    <div className="flex">
      <SearchSidebar filters={filters} setFilters={setFilters} />
      <ExploreGrid filters={filters} />
    </div>
  );
}
