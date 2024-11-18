import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { signOut } from "next-auth/react";
import { CartState, initialState } from "@/types/cart";
import { CartItem, CartType, ItemType } from "@prisma/client";
import { assertCartType } from "@/types/common";

const isValidCartType = (type: string): type is CartType => {
  return Object.values(CartType).includes(type as CartType);
};

export const fetchCartItems = createAsyncThunk(
  "cart/fetchItems",
  async (type: CartType, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/cart/${type.toLowerCase()}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          signOut({ redirect: false });
          return [];
        }
        throw new Error("Failed to fetch cart items");
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addItem",
  async (
    {
      itemId,
      cartType,
      itemType,
    }: {
      itemId: string;
      cartType: CartType;
      itemType: "PRESET" | "PACK";
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      console.log("Starting addToCart thunk with:", {
        itemId,
        cartType,
        itemType,
      });

      if (!cartType || !Object.values(CartType).includes(cartType)) {
        throw new Error(`Invalid cart type: ${cartType}`);
      }

      const response = await fetch(`/api/cart/${cartType.toLowerCase()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          credentials: "include",
        },
        body: JSON.stringify({
          [itemType === "PRESET" ? "presetId" : "packId"]: itemId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Cart API error:", data);
        throw new Error(data.error || "Failed to add item to cart");
      }

      console.log("Cart API response:", data);
      return data;
    } catch (error) {
      console.error("Cart operation failed:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to add to cart"
      );
    }
  }
);

export const moveItem = createAsyncThunk(
  "cart/moveItem",
  async (
    {
      itemId,
      from,
      to,
    }: {
      itemId: string;
      from: CartType;
      to: CartType;
    },
    { dispatch, getState }
  ) => {
    if (!isValidCartType(from) || !isValidCartType(to)) {
      throw new Error("Invalid cart type");
    }
    const originalState = (getState() as RootState).cart;

    try {
      dispatch(moveItemOptimistic({ itemId, from, to }));

      const response = await fetch(`/api/cart/${from}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          from: from.toUpperCase(),
          to: to.toUpperCase(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to move item");
      }

      await Promise.all([
        dispatch(fetchCartItems(from)),
        dispatch(fetchCartItems(to)),
      ]);

      return await response.json();
    } catch (error) {
      dispatch(revertCartState(originalState));
      throw error;
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteItem",
  async ({
    itemId,
    type,
    itemType,
  }: {
    itemId: string;
    type: CartType;
    itemType: ItemType;
  }) => {
    const response = await fetch(`/api/cart/${type}/${itemId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete item");
    return { itemId, type };
  }
);

const serializeItem = (item: any) => ({
  ...item,
  createdAt:
    item.createdAt instanceof Date
      ? item.createdAt.toISOString()
      : item.createdAt,
  updatedAt:
    item.updatedAt instanceof Date
      ? item.updatedAt.toISOString()
      : item.updatedAt,
  priceHistory: item.priceHistory?.map((ph: any) => ({
    ...ph,
    timestamp:
      ph.timestamp instanceof Date ? ph.timestamp.toISOString() : ph.timestamp,
  })),
});

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    moveItemOptimistic: (
      state,
      action: PayloadAction<{ itemId: string; from: CartType; to: CartType }>
    ) => {
      const { itemId, from, to } = action.payload;
      const item = state[from].items.find((item) => item.id === itemId);
      if (item) {
        state[from].items = state[from].items.filter(
          (item) => item.id !== itemId
        );
        state[to].items.push(item);
      }
    },
    optimisticAddToCart: (
      state,
      action: PayloadAction<{
        itemId: string;
        type: CartType;
        item: CartItem;
      }>
    ) => {
      const { type, item } = action.payload;
      const cartType = assertCartType(type.toLowerCase());

      // Log for debugging
      console.log("Optimistic update:", {
        type,
        item,
        currentItems: state[cartType].items,
      });

      // Add item to the appropriate list
      state[cartType].items = [...state[cartType].items, serializeItem(item)];

      // Log after update
      console.log("After update:", { updatedItems: state[cartType].items });
    },
    revertCartState: (state, action: PayloadAction<CartState>) => {
      return action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state, action) => {
        state[action.meta.arg].status = "loading";
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state[action.meta.arg].items = action.payload;
        state[action.meta.arg].status = "idle";
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state[action.meta.arg].status = "failed";
        state[action.meta.arg].error = action.error.message || null;
      });
  },
});

export const { moveItemOptimistic, optimisticAddToCart, revertCartState } =
  cartSlice.actions;

// Selectors
export const selectCartItems = (state: RootState) => state.cart[CartType.CART].items;
export const selectWishlistItems = (state: RootState) => 
  state.cart[CartType.WISHLIST].items;

export default cartSlice.reducer;
