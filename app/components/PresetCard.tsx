"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PresetUpload, PriceType, VST } from "@prisma/client";
import { ContentViewMode } from "@/types/enums";
import { ItemActionButtons } from "./ItemActionButtons";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useAudioPlayer } from "@/app/hooks/useAudioPlayer";
import { Button } from "./ui/button";
import { PlayIcon, PauseIcon } from "lucide-react";
import { AudioPlayer } from "./AudioPlayer";
import { useEffect } from "react";

interface PresetCardProps {
  preset: PresetUpload & {
    vst?: VST | null;
    soundDesigner?: { username: string } | null;
    genre?: { name: string } | null;
  };
  contentViewMode: ContentViewMode;
  variant?: "default" | "compact";
  currentUserId?: string | null;
}

export function PresetCard({
  preset,
  variant,
  currentUserId,
  contentViewMode,
}: PresetCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { isPlaying, activeTrack, audioElement, play, pause, cleanup } =
    useAudioPlayer({
      onError: (error) => {
        console.error("Audio playback error:", error);
        toast.error("Failed to play audio");
      },
    });

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const { data: audio } = useQuery({
    queryKey: ["audio", preset.id],
    queryFn: async () => {
      if (!preset.soundPreviewUrl) return null;
      const audio = new Audio(preset.soundPreviewUrl);
      audio.preload = "auto";
      audio.crossOrigin = "anonymous";
      await new Promise((resolve) => {
        audio.addEventListener("canplaythrough", resolve, { once: true });
        audio.load();
      });
      return audio;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    enabled: !!preset.soundPreviewUrl,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/presetUpload/${preset.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Delete response:", {
          status: response.status,
          data,
        });
        throw new Error(data.error || "Failed to delete preset");
      }

      return data;
    },
    onSuccess: (data) => {
      console.log("Delete success:", data);
      queryClient.invalidateQueries({ queryKey: ["presets"] });
      toast.success("Preset deleted successfully");
    },
    onError: (error) => {
      console.error("Delete mutation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete preset"
      );
    },
  });

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync();
    } catch (error) {
      // Error is handled in the mutation callbacks
    }
  };

  console.log("Preset data:", preset);
  console.log("VST data:", preset.vst);
  if (!preset) return null;

  const displayPrice =
    preset.priceType === PriceType.FREE ? "Free" : `$${preset.price}`;

  return (
    <Card className="w-full relative group overflow-hidden hover:shadow-lg transition-all duration-300 rounded-lg border">
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <ItemActionButtons
          itemId={preset.id}
          type="preset"
          itemStatus={
            contentViewMode === "uploaded"
              ? "uploaded"
              : contentViewMode === "downloaded"
              ? "downloaded"
              : null
          }
          downloadUrl={preset.presetFileUrl ?? undefined}
          title={preset.title}
          onDelete={contentViewMode === "uploaded" ? handleDelete : undefined}
        />
      </div>
      <CardHeader className="border-b p-4">
        <CardTitle className="text-lg font-semibold mb-2">
          {preset.title}
        </CardTitle>
        <div className="flex items-end justify-between text-sm text-muted-foreground">
          <span>{displayPrice}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {preset.soundPreviewUrl && (
          <AudioPlayer
            trackId={preset.id}
            url={preset.soundPreviewUrl}
            onError={(error) => {
              console.error("Audio playback error:", error);
              toast.error("Failed to play audio");
            }}
          />
        )}

        <div className="space-y-1 text-sm text-muted-foreground">
          <div>
            Designer:{" "}
            <span className="font-medium">
              {preset.soundDesigner?.username || "Anonymous"}
            </span>
          </div>
          <div>
            File:{" "}
            <span className="font-medium">
              {preset.originalFileName ||
                preset.presetFileUrl?.split("/").pop() ||
                "Unnamed"}
            </span>
          </div>
          <div>
            Type:{" "}
            <span className="font-medium">
              {preset.presetType || "Uncategorized"}
            </span>
          </div>
          <div>
            Genre:{" "}
            <span className="font-medium">
              {preset.genre?.name || "Unknown"}
            </span>
          </div>
          <div>
            VST:{" "}
            <span className="font-medium">
              {preset.vst?.name || preset.vstId || "N/A"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
