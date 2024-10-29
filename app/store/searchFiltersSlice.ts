import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SearchFilters {
  searchTerm: string;
  showAll: boolean;
  genres: string[];
  vsts: string[];
  types: string[];
  presetTypes: string[];
}

const initialState: SearchFilters = {
  searchTerm: "",
  showAll: true,
  genres: [],
  vsts: [],
  types: [],
  presetTypes: [],
};

const searchFiltersSlice = createSlice({
  name: "searchFilters",
  initialState,
  reducers: {
    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
    },
    toggleShowAll(state, action: PayloadAction<boolean>) {
      state.showAll = action.payload;
      if (action.payload) {
        state.genres = [];
        state.vsts = [];
        state.types = [];
      }
    },
    toggleGenre(state, action: PayloadAction<string>) {
      const genre = action.payload;
      if (state.genres.includes(genre)) {
        state.genres = state.genres.filter((g) => g !== genre);
      } else {
        state.genres.push(genre);
      }
    },
    toggleVST(state, action: PayloadAction<string>) {
      const vst = action.payload;
      if (state.vsts.includes(vst)) {
        state.vsts = state.vsts.filter((v) => v !== vst);
      } else {
        state.vsts.push(vst);
      }
    },
    toggleType(state, action: PayloadAction<string>) {
      const type = action.payload;
      if (state.types.includes(type)) {
        state.types = state.types.filter((t) => t !== type);
      } else {
        state.types.push(type);
      }
    },
    togglePresetType(state, action: PayloadAction<string>) {
      const presetType = action.payload;
      if (state.presetTypes.includes(presetType)) {
        state.presetTypes = state.presetTypes.filter((t) => t !== presetType);
      } else {
        state.presetTypes.push(presetType);
      }
    },
  },
});

export const {
  setSearchTerm,
  toggleShowAll,
  toggleGenre,
  toggleVST,
  toggleType,
} = searchFiltersSlice.actions;

export default searchFiltersSlice.reducer;
