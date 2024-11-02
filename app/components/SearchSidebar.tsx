"use client";

import { useDispatch, useSelector } from "react-redux";
import {
  toggleVST,
  toggleType,
  toggleGenre,
} from "@/app/store/searchFiltersSlice";
import { RootState } from "@/app/store/store";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import { useGenres } from "@/app/hooks/useGenres";
import { cn } from "@/lib/utils";
import { PresetType, VSTType } from "@/types/PresetTypes";

const VST_OPTIONS = ["Serum", "Vital"] as const;
const PRESET_TYPES = ["Pad", "Lead", "Pluck", "Bass", "FX", "Other"] as const;
export interface SearchFilters {
  searchTerm: string;
  genres: string[];
  vsts: string[];
  category: string;
  showAll: boolean;
  presetTypes: string[];
  tags: string[];
  types: string[];
}

export interface SearchSidebarProps {
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
}

export function SearchSidebar({ filters, setFilters }: SearchSidebarProps) {
  const { data: genres, isLoading: isLoadingGenres } = useGenres();
  const dispatch = useDispatch();

  const handleVSTChange = (vst: string, checked: boolean) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      vsts: checked
        ? [...prevFilters.vsts, vst]
        : prevFilters.vsts.filter((v) => v !== vst),
    }));
    dispatch(toggleVST(vst));
  };

  const handlePresetTypeChange = (type: string, checked: boolean) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      presetTypes: checked
        ? [...prevFilters.presetTypes, type]
        : prevFilters.presetTypes.filter((t) => t !== type),
    }));
    dispatch(toggleType(type));
  };

  const handleGenreChange = (genre: string, checked: boolean) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      genres: checked
        ? [...prevFilters.genres, genre]
        : prevFilters.genres.filter((g) => g !== genre),
    }));
    dispatch(toggleGenre(genre));
  };

  return (
    <div className="w-64 bg-gray-100 p-4">
      <div className="mb-4">
        <Label htmlFor="searchbox">Search</Label>
        <Input
          id="searchbox"
          type="text"
          value={filters.searchTerm}
          onChange={(e) =>
            setFilters((prevFilters) => ({
              ...prevFilters,
              searchTerm: e.target.value,
            }))
          }
          placeholder="Search..."
        />
      </div>

      <div className="mb-4">
        <div className="flex items-center">
          <Checkbox
            id="show-all"
            checked={filters.showAll}
            onCheckedChange={(checked) =>
              setFilters((prevFilters) => ({
                ...prevFilters,
                showAll: checked as boolean,
              }))
            }
          />
          <Label htmlFor="show-all" className="ml-2 font-bold">
            Show All
          </Label>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-2">
        <Label>Preset Type</Label>
        {Object.values(PresetType).map((type) => (
          <div key={type} className="flex items-center">
            <Checkbox
              id={`type-${type}`}
              checked={filters.presetTypes.includes(type)}
              onCheckedChange={(checked) =>
                handlePresetTypeChange(type, checked as boolean)
              }
              disabled={filters.showAll}
            />
            <Label htmlFor={`type-${type}`} className="ml-2">
              {type}
            </Label>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-2">
        <Label>Genre</Label>
        {isLoadingGenres ? (
          <div>Loading genres...</div>
        ) : (
          genres?.map((genre: { id: string; name: string }) => (
            <div key={genre.id} className="flex items-center gap-1">
              <Checkbox
                id={`genre-${genre.id}`}
                checked={filters.genres.includes(genre.name)}
                onCheckedChange={(checked) =>
                  handleGenreChange(genre.name, checked as boolean)
                }
                disabled={filters.showAll}
              />
              <Label
                htmlFor={`genre-${genre.id}`}
                className={cn("ml-2", filters.showAll && "text-gray-400")}
              >
                {genre.name}
              </Label>
            </div>
          ))
        )}
      </div>

      <div className="mb-4 flex flex-col gap-2">
        <Label>VST</Label>
        {VST_OPTIONS.map((vst) => (
          <div key={vst} className="flex items-center">
            <Checkbox
              id={`vst-${vst}`}
              checked={filters.vsts.includes(vst)}
              onCheckedChange={(checked) =>
                handleVSTChange(vst, checked as boolean)
              }
              disabled={filters.showAll}
            />
            <Label htmlFor={`vst-${vst}`} className="ml-2">
              {vst}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
