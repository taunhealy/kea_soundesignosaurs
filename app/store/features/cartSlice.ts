import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { signOut } from "next-auth/react";
import { CartState, initialState } from "@/types/cart";
import { CartType, CART_TYPES, isValidCartType } from "@/types/common";


export const fetchCartItems = createAsyncThunk(
  "cart/fetchItems",
  async (type: "cart" | "savedForLater" | "wishlist", { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/cart/${type}`, {
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
    const response = await fetch(`/api/cart/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, itemType }),
    });
    if (!response.ok) throw new Error("Failed to add item to cart");

    await dispatch(fetchCartItems("cart"));
    return response.json();
  }
);

export const moveItem = createAsyncThunk(
  "cart/moveItem",
  async ({ itemId, from, to }: { 
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
  async ({ itemId, type, itemType }: { 
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
    moveItemOptimistic: (state, action) => {
      const { itemId, from, to } = action.payload;
      const fromType = assertCartType(from.toLowerCase());
      const toType = assertCartType(to.toLowerCase());

      const itemIndex = state[fromType].items.findIndex(
        (item) => item.id === itemId
      );
      if (itemIndex !== -1) {
        const [item] = state[fromType].items.splice(itemIndex, 1);
        state[toType].items.push(item);
      }
    },
    revertCartState: (_, action) => action.payload,
    optimisticAddToCart: (
      state,
      action: PayloadAction<{ itemId: string; type: "cart" | "wishlist" }>
    ) => {
      const { itemId, type } = action.payload;
      state.loading[itemId] = true;
    },
  },
  extraReducers: (builder) => {
    // Fetch Cart Items
    builder
      .addCase(fetchCartItems.pending, (state, action) => {
        const type = assertCartType(action.meta.arg);
        state[type].status = "loading";
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        const type = assertCartType(action.meta.arg);
        state[type].items = action.payload;
        state[type].status = "idle";
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        const type = assertCartType(action.meta.arg);
        state[type].status = "failed";
        state[type].error = action.error.message || null;
      });

    // Add to Cart
    builder.addCase(addToCart.fulfilled, (state, action) => {
      const type = assertCartType(action.meta.arg.type.toLowerCase());
      state[type].items.push(action.payload);
    });

    // Move Item
    const moveItemStates = {
      pending: "loading",
      fulfilled: "idle",
      rejected: "failed",
    } as const;

    Object.entries(moveItemStates).forEach(([actionType, status]) => {
      builder.addCase(
        moveItem[actionType as keyof typeof moveItemStates],
        (state, action) => {
          const { from, to } = action.meta.arg;
          state[assertCartType(from.toLowerCase())].status = status;
          state[assertCartType(to.toLowerCase())].status = status;
        }
      );
    });

    // Delete Item
    builder.addCase(deleteCartItem.fulfilled, (state, action) => {
      const type = assertCartType(action.meta.arg.type.toLowerCase());
      state[type].items = state[type].items.filter(
        (item) => item.id !== action.meta.arg.itemId
      );
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
