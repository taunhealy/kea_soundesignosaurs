"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchSidebar } from "./SearchSidebar";
import { PortfolioItemGrid } from "./PortfolioItemGrid";

interface PortfolioItem {
  id: string;
  title: string;
  // ... other properties
}

export function ExplorePortfolioItems() {
  const [filters, setFilters] = useState({
    categories: [],
    country: "",
    focalLength: "",
    searchInput: "",
    camera: "",
    lens: "",
  });

  const {
    data: portfolioItems,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["portfolioItems", filters],
    queryFn: () => fetchPortfolioItems(filters),
  });

  const handleFilterChange = (name: string, value: string | string[]) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error.message}</div>;

  return (
    <div className="flex">
      <SearchSidebar filters={filters} onFilterChange={handleFilterChange} />
      <PortfolioItemGrid items={portfolioItems} />
    </div>
  );
}

async function fetchPortfolioItems(filters: {
  categories: string[];
  country: string;
  focalLength: string;
  searchInput: string;
  camera: string;
  lens: string;
}): Promise<PortfolioItem[]> {
  const queryParams = new URLSearchParams();

  if (filters.categories.length > 0) {
    queryParams.append("categories", filters.categories.join(","));
  }
  if (filters.country) queryParams.append("country", filters.country);
  if (filters.focalLength)
    queryParams.append("focalLength", filters.focalLength);
  if (filters.searchInput)
    queryParams.append("searchInput", filters.searchInput);
  if (filters.camera) queryParams.append("camera", filters.camera);
  if (filters.lens) queryParams.append("lens", filters.lens);

  const response = await fetch(
    `/api/portfolio-items?${queryParams.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch portfolio items");
  }

  return response.json();
}
