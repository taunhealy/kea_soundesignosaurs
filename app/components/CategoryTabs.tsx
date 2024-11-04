"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { SearchFilters } from "@/types/SearchTypes";

// Add this interface at the top of CategoryTabs.tsx
interface CategoryTabsProps {
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
}

export function CategoryTabs({ filters, setFilters }: CategoryTabsProps) {
  const searchParams = useSearchParams();
  const category = searchParams?.get("category") || "presets";

  return (
    <Tabs value={category} className="mb-4">
      <TabsList>
        <TabsTrigger value="presets" asChild>
          <Link href="/?category=presets">Presets</Link>
        </TabsTrigger>
        <TabsTrigger value="requests" asChild>
          <Link href="/?category=requests">Requests</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
