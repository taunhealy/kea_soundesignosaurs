import { Preset } from "@/types/PresetTypes";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageString: string;
  quantity: number;
  creator: string;
  priceAlert?: boolean;
  priceHistory?: {
    price: number;
    timestamp: string;
  }[];
  priceChange?: {
    oldPrice: number;
    percentageChange: number;
  };
}

export interface Cart {
  userId: string;
  items: CartItem[];
  priceChanges?: {
    presetId: string;
    oldPrice: number;
    newPrice: number;
    percentageChange: number;
  }[];
}

export interface CartState {
  cart: {
    items: CartItem[];
    status: "idle" | "loading" | "failed";
    error: string | null;
  };
  savedForLater: {
    items: CartItem[];
    status: "idle" | "loading" | "failed";
    error: string | null;
  };
  wishlist: {
    items: CartItem[];
    status: "idle" | "loading" | "failed";
    error: string | null;
    priceAlerts: boolean;
  };
}

export interface WishlistItem extends CartItem {
  presetId: string;
}

export type CartStateKey = "cart" | "savedForLater" | "wishlist";

export type PresetWithRelations = {
  id: string;
  title: string;
  price: number | null;
  soundPreviewUrl: string | null;
  soundDesigner?: {
    username: string | null;
  } | null;
};

export interface PresetPack {
  id: string;
  title: string;
  description?: string;
  price?: number;
  soundPreviewUrl?: string;
  presets: Preset[];
  soundDesigner?: {
    id: string;
    username: string;
    profileImage?: string;
  };
  tags?: string[];
}

export type CartType = "CART" | "SAVED_FOR_LATER" | "WISHLIST";
