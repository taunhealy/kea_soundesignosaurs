"use client";

import { PresetCard } from "@/app/components/PresetCard";
import { Skeleton } from "@/app/components/ui/skeleton";
import { ContentViewMode } from "@/types/enums";
import { PresetUpload } from "@prisma/client";
import { UploadPresetButton } from "../dashboard/UploadPresetButton";

interface PresetGridProps {
  presets?: PresetUpload[];
  contentViewMode: ContentViewMode;
  isLoading: boolean;
  view?: string | null;
}

export function PresetGrid({
  presets,
  contentViewMode,
  isLoading,
  view,
}: PresetGridProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!presets?.length) {
    return (
      <EmptyState
        contentViewMode={contentViewMode}
        showUploadButton={contentViewMode === ContentViewMode.UPLOADED}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {presets.map((preset) => (
        <PresetCard
          key={preset.id}
          preset={preset}
          contentViewMode={contentViewMode}
        />
      ))}
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
    {[...Array(6)].map((_, i) => (
      <Skeleton key={i} className="h-[400px] w-full" />
    ))}
  </div>
);

const EmptyState = ({
  contentViewMode,
  showUploadButton,
}: {
  contentViewMode: ContentViewMode;
  showUploadButton: boolean;
}) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <p className="text-muted-foreground mb-4">
      {contentViewMode === ContentViewMode.UPLOADED
        ? "You haven't uploaded any presets yet"
        : contentViewMode === ContentViewMode.DOWNLOADED
        ? "You haven't downloaded any presets yet"
        : "No presets found"}
    </p>
    {showUploadButton && <UploadPresetButton />}
  </div>
);
