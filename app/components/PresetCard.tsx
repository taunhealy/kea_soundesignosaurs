"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import {
  PlayIcon,
  PauseIcon,
  EditIcon,
  DownloadIcon,
  TrashIcon,
  FileIcon,
  ShoppingCartIcon,
  HeartIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { WaveformVisualizer } from "./WaveformVisualizer";
import { PriceChangeDisplay } from "./PriceChangeDisplay";
import { type PresetCardProps } from "@/types/PresetTypes";
import { ItemActionButtons } from "./ItemActionButtons";

// Ensure PresetSettings is exported
export interface PresetSettings {
  price?: number;
  soundPreviewUrl?: string;
  downloadUrl?: string;
  spotifyLink?: string;
}

export function PresetCard({ preset, type }: PresetCardProps) {
  const router = useRouter();
  console.log("Preset in card:", preset); // Debug log

  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const queryClient = useQueryClient();

  const { data: priceHistory } = useQuery({
    queryKey: ["priceHistory", preset.id],
    queryFn: async () => {
      const response = await fetch(`/api/presets/${preset.id}/price-history`);
      if (!response.ok) {
        if (response.status === 404) {
          return []; // Return empty array if preset not found
        }
        throw new Error("Failed to fetch price history");
      }
      return response.json();
    },
    enabled: !!preset.id && type === "uploaded",
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  const cleanupAudio = useCallback(() => {
    if (audio) {
      console.log("Cleaning up audio");
      audio.pause();
      audio.removeEventListener("ended", () => setIsPlaying(false));
      setAudio(null);
      setIsPlaying(false);
    }
  }, [audio]);

  useEffect(() => {
    if (audio) {
      console.log("Setting up audio element");
      audio.addEventListener("ended", () => {
        console.log("Audio ended");
        setIsPlaying(false);
      });

      // Ensure audio is ready to play
      audio.load();
    }
    return cleanupAudio;
  }, [audio, cleanupAudio]);

  const togglePlay = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (!preset.soundPreviewUrl) {
        toast.info("No preview available for this preset");
        return;
      }

      console.log("Toggle play called, current state:", { isPlaying, audio });

      if (!audio) {
        console.log("Creating new audio element");
        const newAudio = new Audio();
        newAudio.crossOrigin = "anonymous";
        newAudio.src = preset.soundPreviewUrl;

        // Set initial volume
        newAudio.volume = 1.0;

        newAudio.addEventListener("error", (e) => {
          console.error("Audio error:", e);
          toast.error("Failed to load audio");
          cleanupAudio();
        });

        // Add loading listener
        newAudio.addEventListener("loadeddata", () => {
          console.log("Audio loaded and ready to play");
        });

        setAudio(newAudio);

        // Wait for audio to be ready before playing
        newAudio.addEventListener("canplaythrough", () => {
          newAudio.play().catch((error) => {
            console.error("Play error:", error);
            toast.error("Failed to play audio");
            cleanupAudio();
          });
        });

        setIsPlaying(true);
      } else {
        if (isPlaying) {
          audio.pause();
        } else {
          audio.play().catch(() => {
            toast.error("Failed to play audio");
            cleanupAudio();
          });
        }
        setIsPlaying(!isPlaying);
      }
    },
    [preset.soundPreviewUrl, audio, isPlaying, cleanupAudio]
  );

  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      // Prevent navigation if clicking interactive elements
      if ((e.target as HTMLElement).closest(".interactive-element")) {
        return;
      }
      router.push(`/presetUploads/${preset.id}`);
    },
    [preset.id, router]
  );

  const handleDelete = async () => {
    const response = await fetch(`/api/presetUpload/${preset.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete preset");
    }

    await queryClient.invalidateQueries({ queryKey: ["userPresets"] });
  };

  if (!preset || !preset.id) {
    console.error("Invalid preset data:", preset);
    queryClient.invalidateQueries({ queryKey: ["userPresets"] });
    router.push("/dashboard/presets");
    return null;
  }

  return (
    <Card
      className="relative group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      {type === "uploaded" && (
        <ItemActionButtons
          id={preset.id}
          price={preset.price}
          type="preset"
          onDelete={handleDelete}
          downloadUrl={preset.presetFileUrl}
        />
      )}

      <CardHeader className="pb-2 flex justify-between items-start">
        <CardTitle className="text-[16px] font-regular">
          {preset.title}
        </CardTitle>
        {preset.price !== undefined && preset.price > 0 ? (
          <span className="text-sm font-semibold text-muted-foreground">
            ${preset.price.toFixed(2)}
          </span>
        ) : (
          <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
            Free
          </span>
        )}
      </CardHeader>

      <CardContent>
        {type === "uploaded" && (
          <PriceChangeDisplay
            currentPrice={preset.price ?? 0}
            previousPrice={priceHistory?.[1]?.price}
            size="lg"
            className="mb-4"
            itemType="preset"
          />
        )}
        {/* Metadata section */}
        <div className="space-y-1 mb-4 text-sm text-muted-foreground">
          {preset.soundDesigner && (
            <p className="flex items-center gap-1">
              By:{" "}
              <span className="font-medium">
                {preset.soundDesigner.username}
              </span>
            </p>
          )}
          {preset.genre?.name && (
            <p className="flex items-center gap-1">
              Genre: <span className="font-medium">{preset.genre.name}</span>
            </p>
          )}
          {preset.vst?.name && (
            <p className="flex items-center gap-1">
              VST: <span className="font-medium">{preset.vst.name}</span>
            </p>
          )}
          {preset.presetType && (
            <p className="flex items-center gap-1">
              Type: <span className="font-medium">{preset.presetType}</span>
            </p>
          )}
        </div>

        {preset.presetFileUrl && (
          <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-md mb-4">
            <FileIcon className="h-4 w-4 text-blue-500" />
            <span className="text-sm truncate">
              {preset.originalFileName ||
                preset.presetFileUrl.split("/").pop() ||
                "Preset File"}
            </span>
          </div>
        )}

        {/* Play button */}
        <Button
          onClick={togglePlay}
          className="w-full interactive-element relative flex justify-center items-center"
          variant="outline"
        >
          {isPlaying ? (
            <>
              <PauseIcon className="absolute left-4 h-4 w-4" />
              <div className="w-[200px]">
                <WaveformVisualizer
                  audioElement={audio}
                  isPlaying={isPlaying}
                  amplitudeMultiplier={1.5}
                />
              </div>
            </>
          ) : (
            <>
              <PlayIcon className="mr-2 h-4 w-4" />
              Play Preview
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
