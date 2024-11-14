// Content Types

// Cart Types
export const CART_TYPES = {
  CART: "cart",
  WISHLIST: "wishlist",
} as const;

export type CartType = (typeof CART_TYPES)[keyof typeof CART_TYPES];
