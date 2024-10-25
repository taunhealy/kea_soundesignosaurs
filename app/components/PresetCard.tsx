"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { useCart } from "../hooks/useCart";

interface PresetCardProps {
  preset: {
    id: string;
    name: string;
    settings: {
      price?: number;
      soundPreviewUrl?: string;
      downloadUrl?: string;
    };
  };
}

export function PresetCard({ preset }: PresetCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { addToCart } = useCart();

  const togglePlay = () => {
    const audio = new Audio(preset.settings.soundPreviewUrl);
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="border rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-semibold mb-2">{preset.name}</h3>
      <p className="text-gray-600 mb-2">${preset.settings.price?.toFixed(2)}</p>
      <div className="flex justify-between items-center">
        <Button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</Button>
        <Button
          onClick={() =>
            addToCart({
              id: preset.id,
              title: preset.name,
              price: preset.settings.price || 0,
            })
          }
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
