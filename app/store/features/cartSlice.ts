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
      if (!cartType || !Object.values(CartType).includes(cartType)) {
        throw new Error(`Invalid cart type: ${cartType}`);
      }

      const response = await fetch(`/api/cart/${cartType.toLowerCase()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [itemType === "PRESET" ? "presetId" : "packId"]: itemId,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add item to cart");
      }

      const result = await response.json();
      return result;
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
      const item = state[from.toLowerCase()].items.find(
        (item) => item.id === itemId
      );
      if (item) {
        state[from.toLowerCase()].items = state[
          from.toLowerCase()
        ].items.filter((item) => item.id !== itemId);
        state[to.toLowerCase()].items.push(item);
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
      state[type.toLowerCase()].items.push(serializeItem(item));
    },
    revertCartState: (state, action: PayloadAction<CartState>) => {
      return action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state, action) => {
        const type = assertCartType(action.meta.arg.toLowerCase());
        state[type.toLowerCase()].status = "loading";
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        const type = assertCartType(action.meta.arg.toLowerCase());
        state[type.toLowerCase()].items = action.payload;
        state[type.toLowerCase()].status = "idle";
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        const type = assertCartType(action.meta.arg.toLowerCase());
        state[type.toLowerCase()].status = "failed";
        state[type.toLowerCase()].error = action.error.message || null;
      });
  },
});

export const { moveItemOptimistic, optimisticAddToCart, revertCartState } =
  cartSlice.actions;

// Selectors
export const selectCartItems = (state: RootState) => state.cart.cart.items;
export const selectWishlistItems = (state: RootState) =>
  state.cart.wishlist.items;

export default cartSlice.reducer;
