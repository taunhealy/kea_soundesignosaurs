"use client";

import { useGenres } from "@/app/hooks/useGenres";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Label } from "@/app/components/ui/label";
import { useSearch } from "@/contexts/SearchContext";
import { PresetType, PriceType, VstType } from "@prisma/client";
import { UserStatus } from "@/types/enums";
import { SearchFilters } from "@/types/SearchTypes";

// Add these constant arrays for the filter options
const PRESET_TYPES = Object.values(PresetType);
const PRICE_TYPES = Object.values(PriceType);
const VST_TYPES = Object.values(VstType);

interface SearchSidebarProps {
  filters: SearchFilters;
  onSubmit: (newFilters: Partial<SearchFilters>) => void;
}

export const SearchSidebar: React.FC<SearchSidebarProps> = ({
  filters,
  onSubmit,
}) => {
  const { data: genres } = useGenres();

  return (
    <div className="space-y-6">
      {/* Price Types */}
      <div className="space-y-2">
        <h3 className="font-medium">Price</h3>
        {PRICE_TYPES.map((priceType) => (
          <div key={priceType} className="flex items-center">
            <Checkbox
              id={`price-${priceType}`}
              checked={filters.priceTypes.includes(priceType)}
              onCheckedChange={(checked) => {
                const newFilters = {
                  ...filters,
                  priceTypes: checked
                    ? [...filters.priceTypes, priceType]
                    : filters.priceTypes.filter((type) => type !== priceType),
                };
                onSubmit(newFilters);
              }}
            />
            <Label htmlFor={`price-${priceType}`} className="ml-2">
              {priceType.charAt(0) + priceType.slice(1).toLowerCase()}
            </Label>
          </div>
        ))}
      </div>

      {/* Preset Types */}
      <div className="space-y-2">
        <h3 className="font-medium">Preset Type</h3>
        {PRESET_TYPES.map((presetType) => (
          <div key={presetType} className="flex items-center">
            <Checkbox
              id={`preset-${presetType}`}
              checked={filters.presetTypes.includes(presetType)}
              onCheckedChange={(checked) => {
                const newFilters = {
                  ...filters,
                  presetTypes: checked
                    ? [...filters.presetTypes, presetType]
                    : filters.presetTypes.filter((type) => type !== presetType),
                };
                onSubmit(newFilters);
              }}
            />
            <Label htmlFor={`preset-${presetType}`} className="ml-2">
              {presetType.charAt(0) + presetType.slice(1).toLowerCase()}
            </Label>
          </div>
        ))}
      </div>

      {/* VST Types */}
      <div className="space-y-2">
        <h3 className="font-medium">VST</h3>
        {VST_TYPES.map((vstType) => (
          <div key={vstType} className="flex items-center">
            <Checkbox
              id={`vst-${vstType}`}
              checked={filters.vstTypes.includes(vstType)}
              onCheckedChange={(checked) => {
                const newFilters = {
                  ...filters,
                  vstTypes: checked
                    ? [...filters.vstTypes, vstType]
                    : filters.vstTypes.filter((type) => type !== vstType),
                };
                onSubmit(newFilters);
              }}
            />
            <Label htmlFor={`vst-${vstType}`} className="ml-2">
              {vstType.charAt(0) + vstType.slice(1).toLowerCase()}
            </Label>
          </div>
        ))}
      </div>

      {/* Genres */}
      <div className="space-y-2">
        <h3 className="font-medium">Genres</h3>
        {genres?.map((genre) => (
          <div key={genre.id} className="flex items-center">
            <Checkbox
              id={`genre-${genre.id}`}
              checked={filters.genres.includes(genre.id)}
              onCheckedChange={(checked) => {
                const newFilters = {
                  ...filters,
                  genres: checked
                    ? [...filters.genres, genre.id]
                    : filters.genres.filter((id) => id !== genre.id),
                };
                onSubmit(newFilters);
              }}
            />
            <Label htmlFor={`genre-${genre.id}`} className="ml-2">
              {genre.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
