import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { signOut } from "next-auth/react";
import { CartState, initialState } from "@/types/cart";
import { CartType } from "@prisma/client";
import { assertCartType } from "@/types/common";

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
      type,
      itemType,
      from,
    }: {
      itemId: string;
      type: CartType;
      itemType: "PRESET" | "PACK";
      from?: CartType;
    },
    { dispatch }
  ) => {
    const response = await fetch(`/api/cart/${type.toLowerCase()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, itemType }),
    });
    if (!response.ok) throw new Error("Failed to add item to cart");

    await dispatch(fetchCartItems(CartType.CART));
    return response.json();
  }
);

export const moveItem = createAsyncThunk(
  "cart/moveItem",
  async ({
    itemId,
    from,
    to,
  }: {
    itemId: string;
    from: CartType;
    to: CartType;
  }) => {
    if (!isValidCartType(from) || !isValidCartType(to)) {
      throw new Error("Invalid cart type");
    }
    const originalState = (getState() as RootState).cart;

    try {
      // Optimistic update
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

      // Refresh both carts to ensure consistency
      await Promise.all([
        dispatch(fetchCartItems(from)),
        dispatch(fetchCartItems(to)),
      ]);

      return await response.json();
    } catch (error) {
      // Revert on failure
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
    itemType: "PRESET" | "PACK";
  }) => {
    const response = await fetch(`/api/cart/${type}/${itemId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete item");
    return { itemId, type };
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // ... your reducers ...
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

export const { moveItemOptimistic, revertCartState, optimisticAddToCart } =
  cartSlice.actions;

// Selectors
export const selectCartItems = (state: RootState) => state.cart.cart.items;
export const selectWishlistItems = (state: RootState) =>
  state.cart.wishlist.items;

export default cartSlice.reducer;
