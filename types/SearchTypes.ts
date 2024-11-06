import { ContentType, PriceType, PresetType, VstType } from "@prisma/client";
import { UserStatus } from "./enums";

export interface SearchFilters {
  // Search
  searchTerm: string;
  page: number;
  pageSize: number;

  // View Controls
  contentType: ContentType;
  userStatus: UserStatus;

  // Filter Categories
  priceTypes: PriceType[];
  genres: string[];
  vstTypes: string[];
  presetTypes: PresetType[];
  tags: string[];
  showAll: boolean;
  categories: string[];

  // Sorting
  sortBy: string;
  sortOrder: "asc" | "desc";

  searchQuery?: string;
  selectedGenres?: string[];
  selectedVstTypes?: string[];
  selectedPresetTypes?: string[];
}

export interface SearchFilterUpdate {
  filterKey: keyof SearchFilters;
  value: SearchFilters[keyof SearchFilters];
}

export interface SearchSidebarProps {
  filters: SearchFilters;
  setFilters: (
    filters: SearchFilters | ((prev: SearchFilters) => SearchFilters)
  ) => void;
}

export interface SearchSidebarState {
  filters: SearchFilters;
  setFilters: (
    filters: SearchFilters | ((prev: SearchFilters) => SearchFilters)
  ) => void;
}
