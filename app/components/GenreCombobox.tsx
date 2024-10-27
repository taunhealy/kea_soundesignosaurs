"use client";

import { Combobox } from "@/app/components/ui/combobox";
import { Genre } from "@/app/types/enums";

// Convert enum to array of options with proper typing
const GENRES = Object.entries(Genre).map(([key, value]) => ({
  value: key,      // The enum key (e.g., "FUTURE_BASS")
  label: value,    // The display value (e.g., "Future Bass")
}));

interface GenreComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function GenreCombobox({ value, onChange }: GenreComboboxProps) {
  // Find the matching genre option for the current value
  const currentOption = GENRES.find(
    (genre) => genre.label === value || genre.value === value
  );

  const handleSelect = (value: string) => {
    onChange(value);
  };

  return (
    <Combobox
      value={currentOption?.value || value}
      onSelect={handleSelect}
      options={GENRES}
      placeholder="Select genre..."
    />
  );
}
