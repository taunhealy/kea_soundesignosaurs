// Preset Type Enum
export enum PresetType {
  PAD = "PAD",
  LEAD = "LEAD",
  PLUCK = "PLUCK",
  BASS = "BASS",
  FX = "FX",
  OTHER = "OTHER",
}

// VST Type Enum
export enum VSTType {
  SERUM = "SERUM",
  VITAL = "VITAL",
}

// Base interface for common fields
interface BaseItem {
  id: string;
  title: string;
  description?: string;
  price?: number;
  soundPreviewUrl?: string;
  downloadUrl?: string;
  soundDesigner?: {
    id: string;
    username: string;
    profileImage?: string;
  };
  genre?: {
    id: string;
    name: string;
  };
}

// Preset specific interface
export interface Preset extends BaseItem {
  guide?: string;
  vst?: {
    id: string;
    name: string;
  };
  presetType?: string;
  tags?: string[];
  isFree?: boolean;
}

// Form data interface for creating/editing presets
export interface PresetFormData {
  title: string;
  description?: string;
  guide?: string;
  spotifyLink?: string | null;
  genre?: string;
  vstId?: string;
  presetType?: "PAD" | "LEAD" | "PLUCK" | "BASS" | "FX" | "OTHER";
  tags?: string[];
  soundPreviewUrl?: string;
  presetFileUrl?: string;
}

// API response interface
export interface PresetResponse {
  success: boolean;
  preset?: Preset;
  error?: string;
}

// List response interface
export interface PresetListResponse {
  success: boolean;
  presets?: Preset[];
  totalCount?: number;
  error?: string;
}

// Add this interface for PresetCard props
export interface PresetCardProps {
  preset: {
    id: string;
    title: string;
    price?: number;
    soundPreviewUrl?: string;
    downloadUrl?: string;
    soundDesigner?: {
      username: string;
      profileImage?: string;
    };
    genre?: {
      id: string;
      name: string;
    };
    vst?: {
      id: string;
      name: string;
    };
    presetType?: string;
  };
}
