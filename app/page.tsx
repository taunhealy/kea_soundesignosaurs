"use client";

import { SearchSidebar } from "@/app/components/SearchSidebar";
import { ExploreGrid } from "@/app/components/ExploreGrid";

export default function HomePage() {
  return (
    <div className="flex">
      <SearchSidebar />
      <ExploreGrid initialItems={[]} />
    </div>
  );
}
