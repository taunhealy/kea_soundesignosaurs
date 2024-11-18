// app/components/AudioPlayer.tsx
"use client";

import { Button } from "./ui/button";
import { PlayIcon, PauseIcon } from "lucide-react";
import { useAudioPlayer } from "@/app/hooks/useAudioPlayer";
import { WaveformVisualizer } from "./WaveformVisualizer";
import { useEffect } from "react";

interface AudioPlayerProps {
  trackId: string;
  url: string;
  preloadedAudio?: HTMLAudioElement;
  onError?: (error: Error) => void;
}

export function AudioPlayer({
  trackId,
  url,
  preloadedAudio,
  onError,
}: AudioPlayerProps) {
  const { isPlaying, audioElement, play, pause } = useAudioPlayer({ onError });

  useEffect(() => {
    if (preloadedAudio) {
      play(trackId, url, preloadedAudio);
    }
  }, [preloadedAudio, trackId, url]);

  const handleClick = () => {
    isPlaying ? pause() : play(trackId, url);
  };

  return (
    <Button onClick={handleClick} variant="ghost" size="sm" className="w-full">
      {isPlaying ? (
        <PauseIcon className="h-4 w-4 mr-2" />
      ) : (
        <PlayIcon className="h-4 w-4 mr-2" />
      )}
      {isPlaying ? "Pause" : "Play"}
    </Button>
  );
}
