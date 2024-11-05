import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  audioPlayer: {
    isPlaying: boolean;
    currentTrack: string | null;
    volume: number;
  };
  search: {
    sidebarOpen: boolean;
    selectedFilters: string[];
  };
  modals: {
    uploadPreset: boolean;
    createPack: boolean;
  };
}

const initialState: UIState = {
  audioPlayer: {
    isPlaying: false,
    currentTrack: null,
    volume: 1,
  },
  search: {
    sidebarOpen: false,
    selectedFilters: [],
  },
  modals: {
    uploadPreset: false,
    createPack: false,
  },
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setPlayingTrack(state, action: PayloadAction<string | null>) {
      state.audioPlayer.currentTrack = action.payload;
      state.audioPlayer.isPlaying = !!action.payload;
    },
    toggleSidebar(state) {
      state.search.sidebarOpen = !state.search.sidebarOpen;
    },
    toggleModal(state, action: PayloadAction<keyof UIState["modals"]>) {
      state.modals[action.payload] = !state.modals[action.payload];
    },
  },
});
