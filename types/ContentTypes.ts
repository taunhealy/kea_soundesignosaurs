import { ContentType } from "@prisma/client";
import { SearchFilters } from "./SearchTypes";
import { UserStatus } from "./enums";
export interface ContentListingParams {
  userStatus: UserStatus;
  contentType: ContentType;
  filters?: SearchFilters;
}
