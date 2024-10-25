"use client";

import { useState } from "react";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";

export function SearchSidebar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedVSTs, setSelectedVSTs] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const handleGenreChange = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const handleVSTChange = (vst: string) => {
    setSelectedVSTs(prev =>
      prev.includes(vst) ? prev.filter(v => v !== vst) : [...prev, vst]
    );
  };

  const handleTypeChange = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="w-64 bg-gray-100 p-4">
      <div className="mb-4">
        <Label htmlFor="searchbox">Search</Label>
        <Input
          id="searchbox"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
        />
      </div>

      <div className="mb-4">
        <Label>Genre</Label>
        {["Electronic", "Hip Hop", "Rock", "Pop"].map((genre) => (
          <div key={genre} className="flex items-center">
            <Checkbox
              id={`genre-${genre}`}
              checked={selectedGenres.includes(genre)}
              onCheckedChange={() => handleGenreChange(genre)}
            />
            <Label htmlFor={`genre-${genre}`} className="ml-2">
              {genre}
            </Label>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <Label>VST</Label>
        {["Serum", "Massive", "Omnisphere", "Kontakt"].map((vst) => (
          <div key={vst} className="flex items-center">
            <Checkbox
              id={`vst-${vst}`}
              checked={selectedVSTs.includes(vst)}
              onCheckedChange={() => handleVSTChange(vst)}
            />
            <Label htmlFor={`vst-${vst}`} className="ml-2">
              {vst}
            </Label>
          </div>
        ))}
      </div>

      <div>
        <Label>Type</Label>
        {["Preset", "Sample"].map((type) => (
          <div key={type} className="flex items-center">
            <Checkbox
              id={`type-${type}`}
              checked={selectedTypes.includes(type)}
              onCheckedChange={() => handleTypeChange(type)}
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
