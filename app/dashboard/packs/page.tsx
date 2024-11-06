"use client";

import { PresetPackCard } from "@/app/components/PresetPackCard";
import { Button } from "@/app/components/ui/button";
import { SearchSidebar } from "@/app/components/SearchSidebar";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { useSearch } from "@/contexts/SearchContext";
import { usePresetPacks } from "@/app/hooks/queries/usePresetPacks";
import { Skeleton } from "@/app/components/ui/skeleton";

export default function PacksPage() {
  const { filters, setFilters } = useSearch();
  const { data: packs, isLoading } = usePresetPacks(filters);

  if (isLoading) {
    return (
      <div className="flex flex-col container mx-auto px-4 py-8 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Preset Packs</h1>
          <Link href="/dashboard/packs/create">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Pack
            </Button>
          </Link>
        </div>
        <div className="flex gap-6">
          <div className="w-64 flex-shrink-0">
            <SearchSidebar filters={filters} setFilters={setFilters} />
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-[1200px] max-w-[1200px]">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[400px] w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Preset Packs</h1>
        <Link href="/dashboard/packs/create">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Pack
          </Button>
        </Link>
      </div>

      <div className="flex gap-6">
        <div className="w-64 flex-shrink-0">
          <SearchSidebar filters={filters} setFilters={setFilters} />
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-[1200px] max-w-[1200px]">
            {packs?.map((pack: any) => (
              <PresetPackCard key={pack.id} pack={pack} isOwner={true} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
