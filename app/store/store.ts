import { configureStore } from "@reduxjs/toolkit";
import { SearchFilters } from "../components/SearchSidebar";
import filtersReducer from "./searchFiltersSlice";

export const store = configureStore({
  reducer: {
    filters: filtersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
