import { CartType, ItemType } from "@prisma/client";

export interface CartState {
  cart: {
    items: CartItem[];
    status: "idle" | "loading" | "failed";
    error: string | null;
  };
  wishlist: {
    items: CartItem[];
    status: "idle" | "loading" | "failed";
    error: string | null;
  };
  loading: {
    [key: string]: boolean;
  };
}

export type CartStatus = "idle" | "loading" | "failed";

export type WishlistStatus = "idle" | "loading" | "failed";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageString: string;
  quantity: number;
  creator: string;
  itemType: ItemType;
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

export interface WishlistItem extends CartItem {
  presetId: string;
}

export const initialState: CartState = {
  cart: {
    items: [],
    status: "idle",
    error: null,
  },
  wishlist: {
    items: [],
    status: "idle",
    error: null,
  },
  loading: {},
};

export type CartOperationType = "ADD" | "MOVE" | "REMOVE";

export interface CartOperation {
  itemId: string;
  type: CartOperationType;
  from?: CartType;
  to?: CartType;
  itemType: ItemType;
}

export interface CartApiResponse {
  success: boolean;
  data: CartItem[];
  error?: string;
}
