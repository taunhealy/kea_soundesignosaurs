"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";

export function SearchForm() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<string[]>([]);
  const [genre, setGenre] = useState<string[]>([]);
  const [vst, setVst] = useState<string[]>([]);
  const router = useRouter();

  // Create a handler function for type changes
  const handleTypeChange = (typeValue: string, checked: boolean) => {
    setType((prev) =>
      checked ? [...prev, typeValue] : prev.filter((t) => t !== typeValue)
    );
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const searchParams = new URLSearchParams();
    if (query) searchParams.append("q", query);
    if (type.length) searchParams.append("type", type.join(","));
    if (genre.length) searchParams.append("genre", genre.join(","));
    if (vst.length) searchParams.append("vst", vst.join(","));

    router.push(`/search?${searchParams.toString()}`);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Search Presets and Samples</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-6">
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              type="text"
              placeholder="Search for presets and samples..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="space-y-1">
                <Checkbox
                  id="type-preset"
                  checked={type.includes("preset")}
                  onCheckedChange={(checked) => {
                    handleTypeChange("preset", checked as boolean);
                  }}
                />
                <Label htmlFor="type-preset">Preset</Label>
              </div>
              <div className="space-y-1">
                <Checkbox
                  id="type-sample"
                  checked={type.includes("sample")}
                  onCheckedChange={(checked) => {
                    handleTypeChange("sample", checked as boolean);
                  }}
                />
                <Label htmlFor="type-sample">Sample</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Genre</Label>
              {/* Add genre checkboxes here */}
            </div>

            <div className="space-y-2">
              <Label>VST</Label>
              {/* Add VST checkboxes here */}
            </div>
          </div>

          <Button type="submit">Search</Button>
        </form>
      </CardContent>
    </Card>
  );
}
