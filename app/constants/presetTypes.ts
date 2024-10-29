export const PRESET_TYPES = ["Pad", "Lead", "Pluck", "Bass", "FX", "Other"] as const;
export type PresetType = typeof PRESET_TYPES[number];
