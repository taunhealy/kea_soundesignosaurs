"use client";

import { useState } from "react";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import { useGenres } from "@/app/hooks/useGenres";
import { PriceType, Prisma, VstType, PresetType } from "@prisma/client";
import { SearchFilters, SearchSidebarProps } from "@/types/SearchTypes";
import { PRESET_TYPE_LABELS } from "@/constants/constants";

export function SearchSidebar({ filters, setFilters }: SearchSidebarProps) {
  const { data: genres, isLoading: isLoadingGenres } = useGenres();

  const handleFilterChange = (
    filterType: keyof SearchFilters,
    value: string,
    checked: boolean
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: checked
        ? [...(Array.isArray(prev[filterType]) ? prev[filterType] : []), value]
        : Array.isArray(prev[filterType])
        ? (prev[filterType] as string[]).filter(
            (item: string) => item !== value
          )
        : [],
    }));
  };

  return (
    <div className="w-64 bg-gray-100 p-4">
      <div className="mb-4">
        <Label htmlFor="searchbox">Search</Label>
        <Input
          id="searchbox"
          value={filters.searchTerm}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
          }
          placeholder="Search..."
        />
      </div>

      <div className="mb-4">
        <Label>Preset Type</Label>
        {Object.entries(PRESET_TYPE_LABELS).map(([type, label]) => (
          <div key={type} className="flex items-center">
            <Checkbox
              id={`type-${type}`}
              checked={filters.presetTypes.includes(type as PresetType)}
              onCheckedChange={(checked) =>
                handleFilterChange("presetTypes", type, checked as boolean)
              }
            />
            <Label htmlFor={`type-${type}`} className="ml-2">
              {label}
            </Label>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <Label>Genre</Label>
        {isLoadingGenres ? (
          <div>Loading genres...</div>
        ) : (
          genres?.map((genre: { id: string; name: string }) => (
            <div key={genre.id} className="flex items-center">
              <Checkbox
                id={`genre-${genre.id}`}
                checked={filters.genres.includes(genre.name)}
                onCheckedChange={(checked) =>
                  handleFilterChange("genres", genre.name, checked as boolean)
                }
              />
              <Label htmlFor={`genre-${genre.id}`} className="ml-2">
                {genre.name}
              </Label>
            </div>
          ))
        )}
      </div>

      <div className="mb-4">
        <Label>VST</Label>
        {Object.values(VstType).map((vst) => (
          <div key={vst} className="flex items-center">
            <Checkbox
              id={`vst-${vst}`}
              checked={filters.vsts.includes(vst)}
              onCheckedChange={(checked) =>
                handleFilterChange("vsts", vst, checked as boolean)
              }
            />
            <Label htmlFor={`vst-${vst}`} className="ml-2">
              {vst}
            </Label>
          </div>
        ))}
      </div>

      <div>
        <Label>Price Type</Label>
        {Object.values(PriceType).map((type) => (
          <div key={type} className="flex items-center">
            <Checkbox
              id={`price-${type}`}
              checked={filters.priceTypes.includes(type)}
              onCheckedChange={(checked) =>
                handleFilterChange("priceTypes", type, checked as boolean)
              }
            />
            <Label htmlFor={`price-${type}`} className="ml-2">
              {type}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
