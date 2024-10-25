"use client";

import { useState, useEffect } from "react";
import { SearchForm } from "@/app/components/SearchForm";
import { PresetCard } from "@/app/components/PresetCard";
import { SampleCard } from "@/app/components/SampleCard";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  price: number;
  type: "preset" | "sample";
  soundPreviewUrl: string;
  downloadUrl: string;
  soundDesigner: {
    name: string;
    profileImage: string;
  };
  genre: {
    name: string;
  };
  vst?: {
    name: string;
  };
}

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchParams: URLSearchParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/search?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <SearchForm />
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Search Results</h2>
        {/* Render your search results here */}
      </div>
    </div>
  );
}
