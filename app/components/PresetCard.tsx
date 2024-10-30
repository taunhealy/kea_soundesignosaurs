"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import {
  PlayIcon,
  PauseIcon,
  EditIcon,
  DownloadIcon,
  TrashIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

// Ensure PresetSettings is exported
export interface PresetSettings {
  price?: number;
  soundPreviewUrl?: string;
  downloadUrl?: string;
  spotifyLink?: string;
}

interface PresetCardProps {
  preset: {
    id: string;
    title: string;
    price?: number;
    soundPreviewUrl?: string;
    downloadUrl?: string;
    soundDesigner?: {
      username: string;
      profileImage?: string;
    };
    genre?: {
      name: string;
    };
    vst?: {
      name: string;
    };
    presetType?: string;
  };
}

export function PresetCard({ preset }: PresetCardProps) {
  console.log("Preset in card:", preset); // Debug log

  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const cleanupAudio = useCallback(() => {
    if (audio) {
      audio.pause();
      audio.removeEventListener("ended", () => setIsPlaying(false));
      setAudio(null);
      setIsPlaying(false);
    }
  }, [audio]);

  useEffect(() => {
    if (audio) {
      audio.addEventListener("ended", () => setIsPlaying(false));
    }
    return cleanupAudio;
  }, [audio, cleanupAudio]);

  const togglePlay = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (!preset.soundPreviewUrl) {
        toast.info("No preview available for this preset", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      if (!audio) {
        const newAudio = new Audio(preset.soundPreviewUrl);
        newAudio.addEventListener("error", () => {
          toast.error("Failed to load audio");
          cleanupAudio();
        });
        setAudio(newAudio);
        newAudio.play().catch(() => {
          toast.error("Failed to play audio");
          cleanupAudio();
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

  const handleDownload = useCallback(() => {
    if (!preset.downloadUrl) {
      toast.error("No download URL available");
      return;
    }
    window.open(preset.downloadUrl, "_blank");
  }, [preset.downloadUrl]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event

    if (!confirm("Are you sure you want to delete this preset?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/presetUpload/${preset.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Preset not found");
          queryClient.invalidateQueries({ queryKey: ["userPresets"] });
          return;
        }
        throw new Error("Failed to delete preset");
      }

      toast.success("Preset deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["userPresets"] });
    } catch (error) {
      console.error("Error deleting preset:", error);
      toast.error("Failed to delete preset");
    } finally {
      setIsDeleting(false);
    }
  };

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

  if (!preset) {
    return null; // Or a fallback UI
  }

  return (
    <Card
      className="relative group overflow-hidden hover:shadow-lg transition-all duration-300"
      onClick={handleCardClick}
    >
      {/* Action buttons container */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/dashboard/presets/edit/${preset.id}`);
          }}
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm interactive-element"
        >
          <EditIcon className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleDownload}
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm interactive-element"
        >
          <DownloadIcon className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleDelete}
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm interactive-element"
          disabled={isDeleting}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">{preset.title}</CardTitle>
      </CardHeader>

      <CardContent>
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
          {preset.genre && (
            <p className="flex items-center gap-1">
              Genre: <span className="font-medium">{preset.genre.name}</span>
            </p>
          )}
          {preset.vst && (
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

        {/* Play button */}
        <Button
          onClick={togglePlay}
          className="w-full interactive-element"
          variant="outline"
        >
          {isPlaying ? (
            <PauseIcon className="mr-2 h-4 w-4" />
          ) : (
            <PlayIcon className="mr-2 h-4 w-4" />
          )}
          {isPlaying ? "Pause" : "Play Preview"}
        </Button>
      </CardContent>
    </Card>
  );
}
