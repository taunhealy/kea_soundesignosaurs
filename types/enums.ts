export enum SystemGenres {
  ELECTRONIC = "ELECTRONIC",
  HIP_HOP = "HIP_HOP",
  ROCK = "ROCK",
  METAL = "METAL",
  HARDWAVE = "HARDWAVE",
  WAVE = "WAVE",
  PHONK = "PHONK",
  FUTURE_BASS = "FUTURE_BASS",
  COLOR_BASS = "COLOR_BASS",
  HOUSE = "HOUSE",
  TECHNO = "TECHNO",
  TRANCE = "TRANCE",
  DUBSTEP = "DUBSTEP",
  DRUM_AND_BASS = "DRUM_AND_BASS",
  DRILL = "DRILL",
  AMAPIANO = "AMAPIANO",
  TRAP = "TRAP",
  AMBIENT = "AMBIENT",
  SYNTHWAVE = "SYNTHWAVE",
  EXPERIMENTAL = "EXPERIMENTAL",
  IDM = "IDM",
  BREAKBEAT = "BREAKBEAT",
  GLITCH_HOP = "GLITCH_HOP",
  DOWNTEMPO = "DOWNTEMPO",
  LO_FI = "LO_FI",
  CUSTOM = "CUSTOM",
  SYSTEM = "SYSTEM",
}

export enum UserStatus {
  UPLOADED = "uploaded",
  DOWNLOADED = "downloaded",
  NONE = "none",
}

export const isSystemGenre = (name: string): boolean => {
  return Object.values(SystemGenres).includes(name as SystemGenres);
};

export enum PresetType {
  PAD = "PAD",
  LEAD = "LEAD",
  PLUCK = "PLUCK",
  BASS = "BASS",
  FX = "FX",
  OTHER = "OTHER",
}

export enum PriceType {
  FREE = "FREE",
  PREMIUM = "PREMIUM",
}

export enum VstType {
  SERUM = "SERUM",
  VITAL = "VITAL",
  MASSIVE = "MASSIVE",
  PHASE_PLANT = "PHASE_PLANT",
  PIGMENTS = "PIGMENTS",
  OTHER = "OTHER",
}
