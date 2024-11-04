import { ContentType, PriceType } from "@prisma/client";    

export interface PresetGridProps {
  filters: {
    searchTerm: string;
    genres: string[];
    vsts: string[];
    presetTypes: string[];
    tags: string[];
    category: string;
    showAll: boolean;
    types: string[];
    priceTypes: PriceType[];
    contentType: ContentType;
  };
}
