import { ContentType } from "@prisma/client";
import { SearchFilters } from "./SearchTypes";
import { ContentViewMode } from "./enums";
export interface ContentListingParams {
  viewMode: ContentViewMode;
  contentType: ContentType;
  filters?: SearchFilters;
}
