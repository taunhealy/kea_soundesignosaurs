"use client";

import { PresetPackCard } from "@/app/components/PresetPackCard";
import { Skeleton } from "@/app/components/ui/skeleton";
import { PresetPackWithRelations } from "@/types/presetPack";

export function PresetPackGrid({
  packs,
  type,
  isLoading,
}: {
  packs: PresetPackWithRelations[];
  type: "uploaded" | "downloaded" | "explore";
  isLoading: boolean;
}) {
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
      {packs.map((pack) => (
        <PresetPackCard key={pack.id} pack={pack} />
      ))}
    </div>
  );
}
