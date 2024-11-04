import { PriceType, ContentType } from "@prisma/client";
import { PresetType } from "@prisma/client";

export interface SearchSidebarProps {
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
}

export interface SearchFilters {
  searchTerm: string;
  genres: string[];
  vsts: string[];
  presetTypes: PresetType[];
  tags: string[];
  category: string;
  showAll: boolean;
  types: string[];
  priceTypes: PriceType[];
  contentType: ContentType;
}
