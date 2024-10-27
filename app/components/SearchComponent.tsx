"use client";

import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "./ui/command";
import { useState } from "react";
import { Genre } from "@/app/types/enums";

interface Item {
  id: string;
  name: string;
}

export function SearchComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");

  // Convert Genre enum to array of items
  const genres = Object.values(Genre).map((genre) => ({
    id: genre,
    name: genre,
  }));

  // Filter genres based on search query
  const filteredGenres = genres.filter((genre) =>
    genre.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput
        placeholder="Search genres..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <CommandList>
        {filteredGenres.length === 0 ? (
          <CommandEmpty>No genres found.</CommandEmpty>
        ) : (
          filteredGenres.map((genre) => (
            <CommandItem
              key={genre.id}
              value={genre.name}
              onSelect={() => {
                setSelectedGenre(genre.name);
                setSearchQuery("");
              }}
              className={`cursor-pointer ${
                selectedGenre === genre.name ? "bg-accent" : ""
              }`}
            >
              {genre.name}
            </CommandItem>
          ))
        )}
      </CommandList>
    </Command>
  );
}
