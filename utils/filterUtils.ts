import { SearchFilters } from "@/types/SearchTypes";
import { DisplayMode, UserStatus } from "@/types/enums";
import { ContentType } from "@prisma/client";

export const DEFAULT_FILTERS: SearchFilters = {
  searchTerm: "",
  contentType: ContentType.PRESETS,
  displayMode: DisplayMode.BROWSE,
  userStatus: UserStatus.NONE,
  priceTypes: [],
  genres: [],
  vstTypes: [],
  presetTypes: [],
  tags: [],
  showAll: false,
};

export function updateFilter<K extends keyof SearchFilters>(
  filters: SearchFilters,
  key: K,
  value: SearchFilters[K]
): SearchFilters {
  return {
    ...filters,
    [key]: value,
  };
}

export function toggleArrayFilter<T>(
  currentValues: T[],
  value: T,
  checked: boolean
): T[] {
  if (checked) {
    return [...currentValues, value];
  }
  return currentValues.filter((v) => v !== value);
}
