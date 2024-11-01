export const VST_TYPES = {
  SERUM: "Serum",
  VITAL: "Vital",
  POLYGRID: "Polygrid",
} as const;

export const PRESET_TYPES = {
  PAD: "Pad",
  LEAD: "Lead",
  PLUCK: "Pluck",
  BASS: "Bass",
  FX: "FX",
  OTHER: "Other",
} as const;

export enum VSTType {
  SERUM,
  VITAL,
  // Add any other VST types you need
}

// Define system genres as a const object
export const SystemGenres = {
  ELECTRONIC: "Electronic",
  HIP_HOP: "Hip Hop",
  ROCK: "Rock",
  METAL: "Metal",
  HARDWAVE: "HardWave",
  WAVE: "Wave",
  PHONK: "Phonk",
  FUTURE_BASS: "Future Bass",
  COLOR_BASS: "Color Bass",
  HOUSE: "House",
  TECHNO: "Techno",
  TRANCE: "Trance",
  DUBSTEP: "Dubstep",
  DRUM_AND_BASS: "Drum and Bass",
  DRILL: "Drill",
  AMAPIANO: "Amapiano",
  TRAP: "Trap",
  AMBIENT: "Ambient",
  SYNTHWAVE: "Synthwave",
  EXPERIMENTAL: "Experimental",
  IDM: "IDM",
  BREAKBEAT: "Breakbeat",
  GLITCH_HOP: "Glitch Hop",
  DOWNTEMPO: "Downtempo",
  LO_FI: "Lo-Fi",
} as const;

// Type for system genres
export type SystemGenreType = (typeof SystemGenres)[keyof typeof SystemGenres];

// Type guard for system genres (fixed the incomplete function)
export const isSystemGenre = (genre: string): genre is SystemGenreType => {
  return Object.values(SystemGenres).includes(genre as SystemGenreType);
};
