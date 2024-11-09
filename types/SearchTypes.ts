import { ContentType, PriceType, PresetType, VstType } from "@prisma/client";
import { ContentViewMode, RequestViewMode } from "./enums";

export interface SearchFilters {
  q?: string;
  type?: ContentType;
  view?: ContentViewMode | RequestViewMode;
  priceTypes?: string[];
  genres?: string[];
  vstTypes?: string[];
  presetTypes?: string[];
  tag?: string[];
  p?: number;
  size?: number;
  cat?: string[];
  sort?: string;
  order?: "asc" | "desc";
  status?: string;
  searchTerm?: string;
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
