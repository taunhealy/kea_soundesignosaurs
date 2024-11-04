import { ContentType } from "@prisma/client";
import { SearchFilters } from "./SearchTypes";

export type ListingType = 'UPLOADED' | 'DOWNLOADED';

export interface ContentListingParams {
  listingType: ListingType;
  contentType: ContentType;
  filters?: SearchFilters;
}
