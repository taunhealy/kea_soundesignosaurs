"use client";

import { PresetCard } from "@/app/components/PresetCard";
import { Skeleton } from "@/app/components/ui/skeleton";
import { PresetUpload } from "@prisma/client";

interface PresetGridProps {
  presets: PresetUpload[];
  viewMode: "uploaded" | "downloaded" | "explore";
  isLoading: boolean;
}

export function PresetGrid({ presets, viewMode, isLoading }: PresetGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[400px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {presets?.map((preset: PresetUpload) => (
        <PresetCard
          key={preset.id}
          preset={{
            ...preset,
            soundPreviewUrl: preset.soundPreviewUrl || ""
          }}
          variant="default" 
          type={viewMode}
        />
      ))}
    </div>
  );
}
