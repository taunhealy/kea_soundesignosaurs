"use client";

import { useState } from "react";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";

export function SearchSidebar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedVSTs, setSelectedVSTs] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleGenreChange = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleVSTChange = (vst: string) => {
    setSelectedVSTs((prev) =>
      prev.includes(vst) ? prev.filter((v) => v !== vst) : [...prev, vst]
    );
  };

  const handleTagChange = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
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
        {["Serum", "Vital"].map((vst) => (
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
        <Label>Tags</Label>
        {["Bass", "Lead", "Pad", "FX", "Pluck"].map((tag) => (
          <div key={tag} className="flex items-center">
            <Checkbox
              id={`tag-${tag}`}
              checked={selectedTags.includes(tag)}
              onCheckedChange={() => handleTagChange(tag)}
            />
            <Label htmlFor={`tag-${tag}`} className="ml-2">
              {tag}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
