import { PresetType } from "@prisma/client";
// Make sure PresetType is properly generated in your Prisma schema as an enum

export const PRESET_TYPE_LABELS: Record<PresetType, string> = {
  PAD: "Pad",
  LEAD: "Lead",
  PLUCK: "Pluck",
  BASS: "Bass",
  FX: "FX",
  OTHER: "Other",
} as const;

export const SystemGenres = {
  ELECTRONIC: "ELECTRONIC",
  HIP_HOP: "HIP_HOP",
  ROCK: "ROCK",
  METAL: "METAL",
  HARDWAVE: "HARDWAVE",
  WAVE: "WAVE",
  PHONK: "PHONK",
  // ... add other genres from your GenreType enum
} as const;
