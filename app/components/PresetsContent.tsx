"use client";

import { useQuery } from "@tanstack/react-query";
import { PresetCard } from "@/app/components/PresetCard";
import { useAuth } from "@clerk/nextjs";
import { type Preset as PresetType } from "@/types/PresetTypes";

interface PresetsContentProps {
  type: "downloaded" | "uploaded";
}

export default function PresetsContent({ type }: PresetsContentProps) {
  const { userId } = useAuth();

  const {
    data: presets,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["presets", type],
    queryFn: async () => {
      const response = await fetch(`/api/presets/user?type=${type}`);
      if (!response.ok) {
        throw new Error("Failed to fetch presets");
      }
      const data = await response.json();

      // Transform the data based on type
      if (type === "downloaded") {
        return data.map((download: any) => ({
          ...download.preset,
          soundDesigner: {
            username: download.preset.soundDesigner?.username || "Unknown",
            profileImage: download.preset.soundDesigner?.profileImage || "",
          },
        }));
      }

      return data.map((preset: any) => ({
        ...preset,
        soundDesigner: {
          username: preset.soundDesigner?.username || "Unknown",
          profileImage: preset.soundDesigner?.profileImage || "",
        },
      }));
    },
    enabled: !!userId, // Only run query if userId exists
  });

  if (!userId) {
    return <div>Please sign in to view your presets.</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading presets</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {presets?.map((preset: PresetType) => (
        <PresetCard key={preset.id} preset={preset} />
      ))}
    </div>
  );
}
