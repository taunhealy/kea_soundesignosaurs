import { useState } from "react";
import { Button } from "./ui/button";
import { useCart } from "../hooks/useCart";
import { Sample } from "@/types/SamplePresetTypes";

interface SampleCardProps {
  sample: Sample;
}

export function SampleCard({ sample }: SampleCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { addToCart } = useCart();

  const togglePlay = () => {
    const audio = new Audio(sample.soundPreviewUrl);
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="border rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-semibold mb-2">{sample.title}</h3>
      <p className="text-gray-600 mb-2">${sample.price.toFixed(2)}</p>
      <div className="flex justify-between items-center">
        <Button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</Button>
        <Button
          onClick={() =>
            addToCart({
              id: sample.id,
              title: sample.title,
              price: sample.price,
            })
          }
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
