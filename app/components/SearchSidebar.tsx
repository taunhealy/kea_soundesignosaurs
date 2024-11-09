"use client";

import { useGenres } from "@/app/hooks/useGenres";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { PresetType, PriceType, VstType } from "@prisma/client";
import { SearchFilters } from "@/types/SearchTypes";
import { useDebounce } from "@/app/hooks/useDebounce";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ContentType, BoardView } from "@/types/enums";

const PRESET_TYPES = Object.values(PresetType);
const PRICE_TYPES = Object.values(PriceType);
const VST_TYPES = Object.values(VstType);

interface SearchSidebarProps {
  filters: SearchFilters;
  updateFilters: (filters: SearchFilters) => void;
  contentType: ContentType;
  boardView: BoardView;
}

export const SearchSidebar: React.FC<SearchSidebarProps> = ({
  filters,
  updateFilters,
  contentType,
  boardView,
}) => {
  const { data: genres } = useGenres();
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || "");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const queryClient = useQueryClient();

  const filterMutation = useMutation({
    mutationFn: (newFilters: Partial<SearchFilters>) => {
      updateFilters(newFilters);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presets"] });
    },
  });

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    filterMutation.mutate({
      ...filters,
      searchTerm: value,
    });
  };

  const handleFilterChange = (
    key: keyof SearchFilters,
    value: any,
    checked: boolean
  ) => {
    const newFilters = {
      ...filters,
      [key]: checked
        ? Array.isArray(filters[key])
          ? [...filters[key], value]
          : [value]
        : Array.isArray(filters[key])
        ? filters[key].filter((item: any) => item !== value)
        : [],
    };
    filterMutation.mutate(newFilters);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-medium">Search</h3>
        <Input
          type="text"
          placeholder="Search presets..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {/* Price Types */}
      <div className="space-y-2">
        <h3 className="font-medium">Price</h3>
        {PRICE_TYPES.map((priceType) => (
          <div key={priceType} className="flex items-center">
            <Checkbox
              id={`price-${priceType}`}
              checked={filters.priceTypes?.includes(priceType)}
              onCheckedChange={(checked) =>
                handleFilterChange("priceTypes", priceType, checked as boolean)
              }
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
              checked={filters.presetTypes?.includes(presetType)}
              onCheckedChange={(checked) =>
                handleFilterChange(
                  "presetTypes",
                  presetType,
                  checked as boolean
                )
              }
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
              checked={filters.vstTypes?.includes(vstType)}
              onCheckedChange={(checked) =>
                handleFilterChange("vstTypes", vstType, checked as boolean)
              }
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
              checked={filters.genres?.includes(genre.id)}
              onCheckedChange={(checked) =>
                handleFilterChange("genres", genre.id, checked as boolean)
              }
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
