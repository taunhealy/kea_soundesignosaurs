"use client";

import { PresetCard } from "@/app/components/PresetCard";
import { Skeleton } from "@/app/components/ui/skeleton";
import { useSearch } from "@/contexts/SearchContext";
import { UserStatus } from "@/types/enums";
import { usePresets } from "@/app/hooks/queries/usePresets";
import { Prisma } from "@prisma/client";
import type { PresetUpload } from "@prisma/client";
import { PresetGridProps } from "@/types/PresetGridProps";
import { useAuth } from "@clerk/nextjs";

type PresetWithRelations = Prisma.PresetUploadGetPayload<{
  include: { soundDesigner: true; preset: true };
}>;

export function PresetGrid() {
  const { filters } = useSearch();
  const {
    data: presets,
    isLoading,
    error,
  } = usePresets({
    ...filters,
    type: "uploaded",
  });
  const { userId } = useAuth();

  console.log("PresetGrid - filters:", filters);
  console.log("PresetGrid - presets:", presets);
  console.log("PresetGrid - error:", error);

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[300px] w-full" />
        ))}
      </div>
    );
  }

  if (!presets?.length) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No presets found
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* @ts-ignore */}
      {presets.map((preset) => (
        <PresetCard key={preset.id} preset={preset} variant="default" />
      ))}
    </div>
  );
}
