import { z } from "zod";

// Core enums
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

export enum VSTType {
  SERUM = "Serum",
  VITAL = "Vital",
}

export enum ContentType {
  PRESETS = "presets",
  PACKS = "packs",
}

// Validation constants
export const presetValidation = {
  minPrice: 5,
  maxPrice: 100,
  minTitle: 3,
  maxTitle: 100,
  minDescription: 10,
  maxDescription: 500,
} as const;

// Common interfaces for related entities
export interface SoundDesigner {
  id: string;
  username: string;
  profileImage?: string;
}

export interface Genre {
  id: string;
  name: string;
}

export interface Preset {
  id: string;
  userId: string;
  title: string;
  description?: string;
  price?: number;
  presetFileUrl?: string;
  downloadUrl?: string;
  originalFileName?: string;
  soundPreviewUrl?: string;
  spotifyLink?: string;
  guide?: string;
  presetType?: PresetType;
  priceType: PriceType;
  tags?: string[];
  vst?: VSTType;
  soundDesigner?: { username: string };
  genre?: {
    name: string;
  };
}

// Form validation schema
export const presetSchema = z.object({
  title: z
    .string()
    .min(presetValidation.minTitle)
    .max(presetValidation.maxTitle),
  description: z.string().optional(),
  guide: z.string().optional(),
  spotifyLink: z.string().url().nullish(),
  genreId: z.string().min(1, "Genre is required"),
  vstId: z.string().optional(),
  priceType: z.enum([PriceType.FREE, PriceType.PREMIUM]).optional(),
  presetType: z
    .enum(Object.values(PresetType) as [string, ...string[]])
    .optional(),
  price: z
    .number()
    .min(presetValidation.minPrice)
    .max(presetValidation.maxPrice)
    .optional(),
});

export type PresetFormData = z.infer<typeof presetSchema>;

// API response types
export interface ApiResponse<T> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface ListResponse<T> extends ApiResponse<T[]> {
  totalCount?: number;
}

// Component prop types
export interface PresetCardProps {
  type: "uploaded" | "downloaded";
  soundDesigner: SoundDesigner;
  userId: string;
  preset: Preset;
  variant: "default" | "pack";
  actions?: React.ReactNode;
}

export interface ItemActionButtonsProps {
  id: string;
  price?: number;
  type: "preset" | "pack";
  downloadUrl?: string;
  showDownloadOnly?: boolean;
  hasPurchased?: boolean;
  userStatus?: "uploaded" | "downloaded";
  onDelete?: () => Promise<void>;
}
