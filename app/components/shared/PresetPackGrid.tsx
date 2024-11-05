"use client";

import { PresetPackCard } from "@/app/components/PresetPackCard";
import { Skeleton } from "@/app/components/ui/skeleton";
import { useSearch } from "@/contexts/SearchContext";
import { usePresetPacks } from "@/app/hooks/queries/usePresetPacks";
import { PresetPackWithRelations } from "@/types/presetPack";

export function PresetPackGrid() {
  const { filters } = useSearch();
  const { data: packs, isLoading } = usePresetPacks(filters);

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[400px] w-full" />
        ))}
      </div>
    );
  }

  if (!packs?.length) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No preset packs found
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {packs.map((pack: PresetPackWithRelations) => (
        <PresetPackCard key={pack.id} pack={pack} />
      ))}
    </div>
  );
}
