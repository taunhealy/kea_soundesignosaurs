"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  PlayIcon,
  PauseIcon,
  EditIcon,
  DownloadIcon,
  TrashIcon,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation"; // Changed from next/router
import { useQueryClient } from "@tanstack/react-query";

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
    name: string;
    settings: PresetSettings;
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
    presetType?: string; // Added this line
  };
}

export function PresetCard({ preset }: PresetCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (audio) {
      audio.addEventListener("ended", () => setIsPlaying(false));
    }
    return () => {
      if (audio) {
        audio.removeEventListener("ended", () => setIsPlaying(false));
      }
    };
  }, [audio]);

  const togglePlay = () => {
    if (!preset.settings?.soundPreviewUrl) {
      toast.error("No valid sound preview URL provided.");
      return;
    }

    if (!audio) {
      const newAudio = new Audio(preset.settings.soundPreviewUrl);
      setAudio(newAudio);
      newAudio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  console.log("Preset soundDesigner:", preset.soundDesigner);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this preset?")) {
      try {
        const response = await fetch(`/api/presets/${preset.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete preset");
        }
        alert("Preset deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["presets"] }); // Correct usage of invalidateQueries
      } catch (error) {
        console.error("Error deleting preset:", error);
        alert("Failed to delete preset");
      }
    }
  };

  return (
    <div className="border rounded-lg p-4 shadow-md relative">
      <ToastContainer />
      <h3 className="text-lg font-semibold mb-2">{preset.name}</h3>
      <div className="flex justify-between items-center">
        <Button onClick={togglePlay}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </Button>
        <Button
          onClick={() => window.open(preset.settings.downloadUrl, "_blank")}
        >
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
    </div>
  );
}
