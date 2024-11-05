import { ContentType, PriceType, PresetType, VstType } from "@prisma/client";
import { DisplayMode, UserStatus } from "./enums";

export interface SearchFilters {
  // Search
  searchTerm: string;

  // View Controls
  contentType: ContentType;
  displayMode: DisplayMode;
  userStatus: UserStatus;

  // Filter Categories
  priceTypes: PriceType[];
  genres: string[];
  vstTypes: string[];
  presetTypes: PresetType[];
  tags: string[];
  showAll: boolean;
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
