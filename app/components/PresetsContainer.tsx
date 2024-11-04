"use client";

import { useAuth } from "@clerk/nextjs";
import { PresetGrid } from "./shared/PresetGrid";
import { usePresetsList } from "@/hooks/usePresetQueries";
import type { SearchFilters } from "@/types/SearchTypes";
import { ContentType } from "@prisma/client";

interface PresetsContainerProps {
  type: "uploaded" | "downloaded";
  filters: SearchFilters;
  contentType: ContentType;
  hasPurchased?: boolean;
}

export function PresetsContainer({
  type,
  filters,
  contentType,
}: PresetsContainerProps) {
  const { userId } = useAuth();
  const { data, isLoading, error } = usePresetsList({
    type,
    ...filters,
    contentType,
  });

  const gridType = type === "uploaded" ? "presets" : "requests";

  return (
    <PresetGrid
      items={data ?? []}
      type={gridType}
      isLoading={isLoading}
      userId={userId ?? undefined}
      filters={filters}
    />
  );
}
