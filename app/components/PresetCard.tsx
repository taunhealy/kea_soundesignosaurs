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
import { PriceChangeDisplay } from "./ui/PriceChangeDisplay";

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
    presetFileUrl?: string;
    originalFileName?: string;
    priceHistory?: { price: number }[];
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
    enabled: !!preset.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false
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

  const handleDownload = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      if (!preset.presetFileUrl) {
        toast.error("No preset file available for download");
        return;
      }

      try {
        const response = await fetch(preset.presetFileUrl);
        if (!response.ok) throw new Error("Failed to fetch file");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Extract original filename from URL
        const originalFilename =
          preset.presetFileUrl.split("/").pop() || `${preset.title}.preset`;

        const link = document.createElement("a");
        link.href = url;
        link.download = originalFilename;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success("Download started successfully");
      } catch (error) {
        console.error("Download error:", error);
        toast.error("Failed to download preset");
      }
    },
    [preset]
  );

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

  const addToCartMutation = useMutation({
    mutationFn: async (presetId: string) => {
      const response = await fetch("/api/cart/CART", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presetId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to add to cart" }));
        throw new Error(errorData.error || "Failed to add to cart");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to add to cart");
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (presetId: string) => {
      const response = await fetch("/api/cart/WISHLIST", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presetId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Added to wishlist");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to add to wishlist");
    },
  });

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
        {preset.price && preset.price > 0 ? (
          <Button
            onClick={async (e) => {
              e.stopPropagation();
              addToCartMutation.mutate(preset.id);
            }}
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm interactive-element"
          >
            <ShoppingCartIcon className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleDownload}
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm interactive-element"
          >
            <DownloadIcon className="h-4 w-4" />
          </Button>
        )}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            addToWishlistMutation.mutate(preset.id);
          }}
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm interactive-element"
        >
          <HeartIcon className="h-4 w-4" />
        </Button>
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
        <PriceChangeDisplay
          currentPrice={preset.price ?? 0}
          previousPrice={priceHistory?.[1]?.price}
          size="lg"
          className="mb-4"
          itemType="preset"
        />
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
