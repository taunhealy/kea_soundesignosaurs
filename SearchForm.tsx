"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

export function SearchForm() {
  const [locations, setLocations] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState("");
  const [minEditedPhotos, setMinEditedPhotos] = useState("");
  const [minShootingHours, setMinShootingHours] = useState("");
  const [maxTurnaroundDays, setMaxTurnaroundDays] = useState("");
  const router = useRouter();

  const handleLocationChange = (location: string) => {
    setLocations((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/search?locations=${locations.join(
        ","
      )}&priceRange=${priceRange}&minEditedPhotos=${minEditedPhotos}&minShootingHours=${minShootingHours}&maxTurnaroundDays=${maxTurnaroundDays}`
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <label className="mb-2 font-medium">Location</label>
          <div>
            <label className="inline-flex items-center mr-4">
              <input
                type="checkbox"
                checked={locations.includes("north-island")}
                onChange={() => handleLocationChange("north-island")}
                className="form-checkbox"
              />
              <span className="ml-2">North Island</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={locations.includes("south-island")}
                onChange={() => handleLocationChange("south-island")}
                className="form-checkbox"
              />
              <span className="ml-2">South Island</span>
            </label>
          </div>
        </div>
        <Select onValueChange={setPriceRange}>
          <SelectTrigger>
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="budget">Budget</SelectItem>
            <SelectItem value="mid-range">Mid-range</SelectItem>
            <SelectItem value="luxury">Luxury</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          value={minEditedPhotos}
          onChange={(e) => setMinEditedPhotos(e.target.value)}
          placeholder="Min. Edited Photos"
        />
        <Input
          type="number"
          value={minShootingHours}
          onChange={(e) => setMinShootingHours(e.target.value)}
          placeholder="Min. Shooting Hours"
        />
        <Input
          type="number"
          value={maxTurnaroundDays}
          onChange={(e) => setMaxTurnaroundDays(e.target.value)}
          placeholder="Max. Turnaround Days"
        />
      </div>
      <Button type="submit" className="mt-4 w-full">
        Search Photographers
      </Button>
    </form>
  );
}
