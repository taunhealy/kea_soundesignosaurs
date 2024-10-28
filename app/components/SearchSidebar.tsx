"use client";

import { useState, useEffect } from "react";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import { useGenres } from "@/app/hooks/useGenres";

interface SearchSidebarProps {
  filters: {
    searchTerm: string;
    genres: string[];
    vsts: string[];
    presetTypes: string[];
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      searchTerm: string;
      genres: string[];
      vsts: string[];
      presetTypes: string[];
    }>
  >;
}

export function SearchSidebar({ filters, setFilters }: SearchSidebarProps) {
  const { data: genres, isLoading: isLoadingGenres } = useGenres();

  const handleGenreChange = (genre: string) => {
    setFilters((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const handleVSTChange = (vst: string) => {
    setFilters((prev) => ({
      ...prev,
      vsts: prev.vsts.includes(vst)
        ? prev.vsts.filter((v) => v !== vst)
        : [...prev.vsts, vst],
    }));
  };

  const handlePresetTypeChange = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      presetTypes: prev.presetTypes.includes(type)
        ? prev.presetTypes.filter((t) => t !== type)
        : [...prev.presetTypes, type],
    }));
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
            setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
          }
          placeholder="Search..."
        />
      </div>

      <div className="mb-4">
        <Label>Genre</Label>
        {isLoadingGenres ? (
          <div>Loading genres...</div>
        ) : (
          genres?.map((genre) => (
            <div key={genre.id} className="flex items-center">
              <Checkbox
                id={`genre-${genre.id}`}
                checked={filters.genres.includes(genre.name)}
                onCheckedChange={() => handleGenreChange(genre.name)}
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
        {["Serum", "Vital"].map((vst) => (
          <div key={vst} className="flex items-center">
            <Checkbox
              id={`vst-${vst}`}
              checked={filters.vsts.includes(vst)}
              onCheckedChange={() => handleVSTChange(vst)}
            />
            <Label htmlFor={`vst-${vst}`} className="ml-2">
              {vst}
            </Label>
          </div>
        ))}
      </div>

      <div>
        <Label>Preset Type</Label>
        {["Pad", "Lead", "Pluck", "Bass", "FX", "Other"].map((type) => (
          <div key={type} className="flex items-center">
            <Checkbox
              id={`type-${type}`}
              checked={filters.presetTypes.includes(type)}
              onCheckedChange={() => handlePresetTypeChange(type)}
            />
            <Label htmlFor={`type-${type}`} className="ml-2">
              {type}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
