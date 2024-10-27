"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { PlayIcon, PauseIcon, EditIcon, DownloadIcon } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation"; // Changed from next/router

interface PresetSettings {
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
  };
}

export function PresetCard({ preset }: PresetCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const router = useRouter();

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

  return (
    <div className="border rounded-lg p-4 shadow-md relative">
      <ToastContainer />
      <h3 className="text-lg font-semibold mb-2">{preset.name}</h3>
      <p className="text-gray-600 mb-2">
        $
        {preset.settings?.price !== undefined
          ? preset.settings.price.toFixed(2)
          : "N/A"}
      </p>
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
    </div>
  );
}
