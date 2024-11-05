import { z } from "zod";
import { UserStatus } from "./enums";
import {
  PresetType,
  PresetUpload,
  PriceType,
  ContentType,
  SoundDesigner as PrismaSoundDesigner,
  Genre as PrismaGenre,
} from "@prisma/client";

import type { SearchFilters } from "@/types/SearchTypes";

export enum VSTType {
  SERUM = "Serum",
  VITAL = "Vital",
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
  preset: {
    id: string;
    title: string;
    price: number | null;
    priceType: "FREE" | "PREMIUM";
    presetType: string;
    soundDesigner?: {
      username: string;
      profileImage: string | null;
    };
    genre?: {
      name: string;
    };
    vst?: {
      name: string;
    };
  };
  variant?: "default" | "compact";
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

export interface PresetsContainerProps {
  type: "uploaded" | "downloaded";
  filters: SearchFilters;
  contentType: ContentType;
  hasPurchased?: boolean;
}
