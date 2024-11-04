import { PresetCard } from "../PresetCard";
import { PresetPackCard } from "../PresetPackCard";
import { RequestCard } from "../RequestCard";
import type { PresetCardProps } from "@/types/PresetTypes";
import { PriceType, ContentType } from "@prisma/client";

interface Preset {
  id: string;
  title: string;
  description?: string;
  presetType: string;
  genre?: {
    id: string;
    name: string;
    type: string;
  };
  vst?: {
    id: string;
    name: string;
    type: string;
  };
  // Add other properties as needed
}

interface PresetGridProps {
  items: Preset[];
  type: "presets" | "requests";
  isLoading: boolean;
  userId?: string;
  filters: {
    genres?: string[];
    vsts?: string[];
    priceTypes?: PriceType[];
    contentTypes?: ContentType[];
    searchTerm?: string;
  };
}

export function PresetGrid({
  items,
  type,
  isLoading,
  userId,
  filters,
}: PresetGridProps) {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!items.length) {
    return <div>No items found</div>;
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.id} className="border p-4 rounded-lg">
          <h3 className="font-bold">{item.title}</h3>
          <p>{item.description}</p>
          <p>Type: {item.presetType}</p>
          {/* Render the name property of genre, not the entire object */}
          {item.genre && <p>Genre: {item.genre.name}</p>}
          {/* Render the name property of vst, not the entire object */}
          {item.vst && <p>VST: {item.vst.name}</p>}
          {/* Add any other properties you want to display */}
        </div>
      ))}
    </div>
  );
}
