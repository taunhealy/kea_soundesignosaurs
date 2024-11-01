import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { CartState, CartItem, CartStateKey, CartType } from "@/lib/interfaces";
import { toast } from "react-hot-toast";
import { RootState } from "../store";

interface CartItemWithTracking extends CartItem {
  priceHistory: {
    price: number;
    timestamp: string;
  }[];
  notifyOnPriceDrop?: boolean;
}

const initialState: CartState = {
  cart: {
    items: [],
    status: "idle",
    error: null,
  },
  savedForLater: {
    items: [],
    status: "idle",
    error: null,
  },
  wishlist: {
    items: [],
    status: "idle",
    error: null,
    priceAlerts: false,
  },
};

// Async thunks for each cart type
export const fetchCartItems = createAsyncThunk(
  "cart/fetchItems",
  async (cartType: "cart" | "savedForLater" | "wishlist") => {
    const upperCaseType =
      cartType === "savedForLater" ? "SAVED_FOR_LATER" : cartType.toUpperCase();
    const response = await fetch(`/api/cart/${upperCaseType}`);
    if (!response.ok) throw new Error("Failed to fetch items");
    const data = await response.json();
    
    console.log("Raw response data:", data);
    
    const mappedData = data.map((item: any) => ({
      ...item,
      priceHistory:
        item.priceHistory?.map((history: any) => ({
          price: Number(history.price),
          timestamp: new Date(history.timestamp),
        })) || [],
    }));
    
    console.log("Mapped data:", mappedData);
    return mappedData;
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (
    { presetId, type }: { presetId: string; type: CartType },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`/api/cart/${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ presetId }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to add to cart"
      );
    }
  }
);

export const moveItem = createAsyncThunk(
  "cart/moveItem",
  async (
    { itemId, from, to }: { itemId: string; from: CartType; to: CartType },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`/api/cart/${from}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId, from, to }),
      });

      if (!response.ok) {
        throw new Error("Failed to move item");
      }

      return { itemId, from, to };
    } catch (error) {
      return rejectWithValue("Failed to move item");
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteItem",
  async (
    { itemId, type }: { itemId: string; type: CartType },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `/api/cart/${type.toLowerCase()}/${itemId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error);
      }

      return itemId;
    } catch (error) {
      return rejectWithValue("Failed to delete item");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    togglePriceAlert: (state, action: PayloadAction<{ itemId: string }>) => {
      const item = state.wishlist.items.find(
        (item) => item.id === action.payload.itemId
      );
      if (item) {
        item.priceAlert = !item.priceAlert;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch handlers for each cart type
      .addCase(fetchCartItems.pending, (state, action) => {
        const cartType = action.meta.arg;
        state[cartType].status = "loading";
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        const cartType = action.meta.arg;
        state[cartType].items = action.payload;
        state[cartType].status = "idle";
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        const cartType = action.meta.arg;
        state[cartType].status = "failed";
        state[cartType].error = action.error.message ?? "Failed to fetch items";
      })
      // Move item handlers
      .addCase(moveItem.pending, (state, action) => {
        state.cart.status = "loading";
        state.savedForLater.status = "loading";
        state.wishlist.status = "loading";
      })
      .addCase(moveItem.fulfilled, (state, action) => {
        const { itemId, from, to } = action.payload;
        const fromKey =
          from === "SAVED_FOR_LATER" ? "savedForLater" : from.toLowerCase();
        const toKey =
          to === "SAVED_FOR_LATER" ? "savedForLater" : to.toLowerCase();

        const fromList = state[fromKey as CartStateKey];
        const toList = state[toKey as CartStateKey];

        const itemIndex = fromList.items.findIndex(
          (item) => item.id === itemId
        );
        if (itemIndex !== -1) {
          const [item] = fromList.items.splice(itemIndex, 1);
          toList.items.push(item);
        }

        state.cart.status = "idle";
        state.savedForLater.status = "idle";
        state.wishlist.status = "idle";
      })
      .addCase(moveItem.rejected, (state, action) => {
        state.cart.status = "failed";
        state.savedForLater.status = "failed";
        state.wishlist.status = "failed";
        state.cart.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to move item";
        toast.error(
          typeof action.payload === "string"
            ? action.payload
            : "Failed to move item"
        );
      })
      // Delete wishlist item handlers
      .addCase(deleteCartItem.pending, (state) => {
        state.wishlist.status = "loading";
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.wishlist.items = state.wishlist.items.filter(
          (item) => item.id !== action.payload
        );
        state.wishlist.status = "idle";
        toast.success("Item removed from wishlist");
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.wishlist.status = "failed";
        state.wishlist.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to delete item";
        toast.error(
          typeof action.payload === "string"
            ? action.payload
            : "Failed to delete item"
        );
      });
  },
});

// Selectors
export const selectCartItems = (state: RootState) => state.cart.cart.items;
export const selectSavedItems = (state: RootState) =>
  state.cart.savedForLater.items;
export const selectWishlistItems = (state: RootState) =>
  state.cart.wishlist.items;

export const { togglePriceAlert } = cartSlice.actions;

export default cartSlice.reducer;
