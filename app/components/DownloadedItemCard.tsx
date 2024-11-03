"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Download, User, Music2, Box, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { PauseIcon, PlayIcon } from "lucide-react";
import { PresetType } from "@prisma/client";

interface DownloadedItemProps {
  id: string;
  title: string;
  type: "PRESET" | "PACK";
  downloadUrl: string;
  creator: string;
  description: string;
  genre?: string;
  presetType?: PresetType;
  vst?: string;
  soundPreviewUrl?: string;
}

export function DownloadedItemCard({
  id,
  title,
  type,
  downloadUrl,
  creator,
  description,
  genre,
  presetType,
  vst,
  soundPreviewUrl,
}: DownloadedItemProps) {
  console.log({ genre, presetType, vst });
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking the download button
    if ((e.target as HTMLElement).closest(".download-button")) {
      return;
    }

    // Route based on type
    const route =
      type === "PRESET" ? `/presetUploads/${id}` : `/presetPacks/${id}`;
    router.push(route);
  };

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <Card
      className="relative group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <User className="h-4 w-4" />
              <span>{creator}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {soundPreviewUrl && (
              <Button
                variant="ghost"
                size="icon"
                className="interactive-element"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <PauseIcon className="h-5 w-5" />
                ) : (
                  <PlayIcon className="h-5 w-5" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="interactive-element"
              onClick={(e) => {
                e.stopPropagation();
                window.open(downloadUrl, "_blank");
              }}
            >
              <Download className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          {genre && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Music2 className="h-4 w-4" />
              <span>{genre}</span>
            </div>
          )}
          {vst && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Box className="h-4 w-4" />
              <span>{vst}</span>
            </div>
          )}
          {presetType && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="h-4 w-4" />
              <span>{presetType}</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
      </CardContent>
      {soundPreviewUrl && (
        <audio
          ref={audioRef}
          src={soundPreviewUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
    </Card>
  );
}
