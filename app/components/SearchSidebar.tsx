"use client";

import { useGenres } from "@/app/hooks/useGenres";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Label } from "@/app/components/ui/label";
import { useSearch } from "@/contexts/SearchContext";
import { PriceType, Genre, VstType } from "@prisma/client";

export function SearchSidebar() {
  const { filters, toggleFilter } = useSearch();
  const { data: genres, isLoading: isLoadingGenres } = useGenres();

  const handleVstTypeChange = (type: string, checked: boolean) => {
    const updatedVstTypes = checked
      ? [...filters.vstTypes, type as VstType]
      : filters.vstTypes.filter((t) => t !== type);

    console.log("Updating VST types:", { type, checked, updatedVstTypes });

    toggleFilter("vstTypes", type, checked as boolean);
  };

  return (
    <div className="w-64 space-y-6">
      {filters.displayMode === "browse" && (
        <>
          <div>
            <Label>Price Type</Label>
            {Object.values(PriceType).map((type) => (
              <div key={type} className="flex items-center">
                <Checkbox
                  id={`price-${type}`}
                  checked={filters.priceTypes.includes(type)}
                  onCheckedChange={(checked) =>
                    toggleFilter("priceTypes", type, checked as boolean)
                  }
                />
                <Label htmlFor={`price-${type}`} className="ml-2">
                  {type}
                </Label>
              </div>
            ))}
          </div>

          <div>
            <Label>Vst Type</Label>
            {Object.values(VstType).map((type) => (
              <div key={type} className="flex items-center">
                <Checkbox
                  id={`vst-${type}`}
                  checked={filters.vstTypes.includes(type)}
                  onCheckedChange={(checked: boolean) =>
                    handleVstTypeChange(type, checked)
                  }
                />
                <Label htmlFor={`vst-${type}`} className="ml-2">
                  {type}
                </Label>
              </div>
            ))}
          </div>

          {!isLoadingGenres && (
            <div>
              <Label>Genres</Label>
              {genres?.map((genre: Genre) => (
                <div key={genre.id} className="flex items-center">
                  <Checkbox
                    id={`genre-${genre.id}`}
                    checked={filters.genres.includes(genre.id)}
                    onCheckedChange={(checked) =>
                      toggleFilter("genres", genre.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={`genre-${genre.id}`} className="ml-2">
                    {genre.name}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
