// Base interface for common fields
interface BaseItem {
  id: string;
  title: string;
  description: string;
  price: number;
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
  presetType?: 'Pad' | 'Lead' | 'Pluck' | 'Bass' | 'FX' | 'Other';
  tags?: string[];
  isFree?: boolean;
}

// Form data interface for creating/editing presets
export interface PresetFormData {
  title: string;
  description: string;
  guide: string;
  spotifyLink?: string;
  genre?: string;
  vstType: 'SERUM' | 'VITAL';
  presetType: 'Pad' | 'Lead' | 'Pluck' | 'Bass' | 'FX' | 'Other';
  tags?: string[];
  isFree: boolean;
  soundPreviewUrl?: string;
  presetFileUrl: string;
  price?: number;
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
