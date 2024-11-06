import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SearchFilters } from "@/types/SearchTypes";
import { ContentType } from "@prisma/client";
import { UserStatus } from "@/types/enums";

const initialState: SearchFilters = {
  searchTerm: "",
  priceTypes: [],
  genres: [],
  vstTypes: [],
  presetTypes: [],
  tags: [],
  showAll: false,
  categories: [],
  page: 1,
  pageSize: 20,
  contentType: ContentType.PRESETS,
  userStatus: UserStatus.UPLOADED,
  sortBy: "",
  sortOrder: "asc",
};

export const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    updateFilters: (state, action: PayloadAction<Partial<SearchFilters>>) => {
      return { ...state, ...action.payload };
    },
    clearAllFilters: () => initialState,
  },
});

export const { updateFilters, clearAllFilters } = filtersSlice.actions;
export default filtersSlice.reducer;
