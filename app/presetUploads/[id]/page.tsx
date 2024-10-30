"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/app/components/ui/button";
import { PlayIcon, PauseIcon } from "lucide-react";
import { toast } from "react-hot-toast";

export default function PresetPage({ params }: { params: { id: string } }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const { data: preset, isLoading } = useQuery({
    queryKey: ["preset", params.id],
    queryFn: async () => {
      const response = await fetch(`/api/presetUpload/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch preset");
      }
      return response.json();
    },
  });

  const cleanupAudio = useCallback(() => {
    if (audio) {
      audio.pause();
      audio.removeEventListener("ended", () => setIsPlaying(false));
      setAudio(null);
      setIsPlaying(false);
    }
  }, [audio]);

  useEffect(() => {
    return () => cleanupAudio();
  }, [cleanupAudio]);

  const togglePlay = useCallback(() => {
    if (!preset?.soundPreviewUrl) {
      toast.error("No sound preview available");
      return;
    }

    if (!audio) {
      const newAudio = new Audio(preset.soundPreviewUrl);
      newAudio.addEventListener("ended", () => setIsPlaying(false));
      setAudio(newAudio);
      newAudio.play().catch((error) => {
        console.error("Audio playback error:", error);
        toast.error("Failed to play audio");
        cleanupAudio();
      });
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().catch((error) => {
          console.error("Audio playback error:", error);
          toast.error("Failed to play audio");
          cleanupAudio();
        });
        setIsPlaying(true);
      }
    }
  }, [preset?.soundPreviewUrl, audio, isPlaying, cleanupAudio]);

  if (isLoading) return <div>Loading...</div>;
  if (!preset) return <div>Preset not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{preset.title}</h1>

        <div className="flex items-center gap-4 mb-6">
          <Button onClick={togglePlay} variant="outline" size="lg">
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
            {isPlaying ? "Pause" : "Play Preview"}
          </Button>

          {preset.presetFileUrl && (
            <Button size="lg">
              {preset.isFree ? "Download Free" : `Buy for $${preset.price}`}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{preset.description}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Details</h2>
            <dl className="grid grid-cols-2 gap-2">
              <dt className="text-gray-600">Genre:</dt>
              <dd>{preset.genre?.name}</dd>
              <dt className="text-gray-600">VST:</dt>
              <dd>{preset.vst?.name}</dd>
              <dt className="text-gray-600">Type:</dt>
              <dd>{preset.presetType}</dd>
              {preset.spotifyLink && (
                <>
                  <dt className="text-gray-600">Reference:</dt>
                  <dd>
                    <a
                      href={preset.spotifyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Listen on Spotify
                    </a>
                  </dd>
                </>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
