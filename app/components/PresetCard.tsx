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
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./ui/card";
import { type Preset } from "@/types/PresetTypes";

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
      profileImage: string;
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

export const PresetCard: React.FC<PresetCardProps> = ({ preset }) => {
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

  const togglePlay = useCallback(() => {
    if (!preset.soundPreviewUrl) {
      toast.error("No sound preview available");
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
  }, [preset.soundPreviewUrl, audio, isPlaying, cleanupAudio]);

  const handleDownload = useCallback(() => {
    if (!preset.downloadUrl) {
      toast.error("No download URL available");
      return;
    }
    window.open(preset.downloadUrl, "_blank");
  }, [preset.downloadUrl]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this preset?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/presets/${preset.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete preset");

      toast.success("Preset deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["presets"] });
    } catch (error) {
      console.error("Error deleting preset:", error);
      toast.error("Failed to delete preset");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on buttons
    if (
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest(".button-container")
    ) {
      return;
    }
    router.push(`/presets/${preset.id}`); // Changed from /dashboard/presets/ to /presets/
  };

  return (
    <Card className="relative" onClick={handleCardClick}>
      <CardHeader>
        <CardTitle>{preset.title}</CardTitle>
        <CardContent>
          <div className="flex justify-between items-center gap-4">
            <Button onClick={togglePlay} variant="outline">
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </Button>
            <Button onClick={handleDownload}>
              <DownloadIcon className="w-4 h-4" />
              <span>Download</span>
            </Button>
          </div>
          <button
            onClick={() => router.push(`/dashboard/presets/edit/${preset.id}`)}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md"
          >
            <EditIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="absolute top-2 right-10 p-2 bg-white rounded-full shadow-md"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
          <div className="text-sm text-gray-500 mb-2">
            {preset.soundDesigner && <p>By: {preset.soundDesigner.username}</p>}
            {preset.genre && <p>Genre: {preset.genre.name}</p>}
            {preset.vst && <p>VST: {preset.vst.name}</p>}
            {preset.presetType && <p>Preset Type: {preset.presetType}</p>}
          </div>
        </CardContent>
      </CardHeader>
    </Card>
  );
};

export default PresetCard; // Add this line at the end
