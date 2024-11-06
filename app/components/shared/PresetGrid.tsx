"use client";

import { PresetCard } from "@/app/components/PresetCard";
import { Skeleton } from "@/app/components/ui/skeleton";
import { PresetUpload } from "@prisma/client";

interface PresetGridProps {
  presets?: any[];
  type: "uploaded" | "downloaded" | "explore";
  isLoading: boolean;
}

export function PresetGrid({ presets, type, isLoading }: PresetGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
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
    <div className="grid gap-4 grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
      {presets.map((preset: PresetUpload) => (
        <PresetCard
          key={preset.id}
          preset={preset}
          variant="default"
          type={type}
        />
      ))}
    </div>
  );
}
