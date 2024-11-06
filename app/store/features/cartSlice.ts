import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CartState, CartItem } from '@/lib/interfaces';
import { CartType } from '@prisma/client';
import type { RootState } from '../store';

const initialState: CartState = {
  cart: {
    items: [],
    status: 'idle',
    error: null,
  },
  savedForLater: {
    items: [],
    status: 'idle',
    error: null,
  },
  wishlist: {
    items: [],
    status: 'idle',
    error: null,
    priceAlerts: false,
  },
};

export const fetchCartItems = createAsyncThunk(
  'cart/fetchItems',
  async (type: 'cart' | 'savedForLater' | 'wishlist') => {
    const response = await fetch(`/api/cart/${type}`);
    if (!response.ok) throw new Error('Failed to fetch cart items');
    return response.json();
  }
);

export const addToCart = createAsyncThunk(
  'cart/addItem',
  async ({ itemId, type, itemType }: { itemId: string; type: CartType; itemType: 'PRESET' | 'PACK' }) => {
    const response = await fetch(`/api/cart/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, itemType }),
    });
    if (!response.ok) throw new Error('Failed to add item to cart');
    return response.json();
  }
);

export const moveItem = createAsyncThunk(
  'cart/moveItem',
  async ({ itemId, from, to }: { itemId: string; from: CartType; to: CartType }) => {
    const response = await fetch(`/api/cart/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, from, to }),
    });
    if (!response.ok) throw new Error('Failed to move item');
    return response.json();
  }
);

export const deleteCartItem = createAsyncThunk(
  'cart/deleteItem',
  async ({ itemId, type }: { itemId: string; type: CartType }) => {
    const response = await fetch(`/api/cart/${type}/${itemId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete item');
    return { itemId, type };
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Cart Items
      .addCase(fetchCartItems.pending, (state, action) => {
        const type = action.meta.arg;
        state[type].status = 'loading';
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        const type = action.meta.arg;
        state[type].items = action.payload;
        state[type].status = 'idle';
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        const type = action.meta.arg;
        state[type].status = 'failed';
        state[type].error = action.error.message || null;
      })
      // Add to Cart
      .addCase(addToCart.fulfilled, (state, action) => {
        const type = action.meta.arg.type.toLowerCase() as 'cart' | 'savedForLater' | 'wishlist';
        state[type].items.push(action.payload);
      })
      // Move Item
      .addCase(moveItem.fulfilled, (state, action) => {
        const { from, to } = action.meta.arg;
        const fromType = from.toLowerCase() as 'cart' | 'savedForLater' | 'wishlist';
        const toType = to.toLowerCase() as 'cart' | 'savedForLater' | 'wishlist';
        
        // Remove from source
        state[fromType].items = state[fromType].items.filter(
          item => item.id !== action.payload.id
        );
        // Add to destination
        state[toType].items.push(action.payload);
      })
      // Delete Item
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        const type = action.meta.arg.type.toLowerCase() as 'cart' | 'savedForLater' | 'wishlist';
        state[type].items = state[type].items.filter(
          item => item.id !== action.meta.arg.itemId
        );
      });
  },
});

// Selectors
export const selectCartItems = (state: RootState) => state.cart.cart.items;
export const selectSavedItems = (state: RootState) => state.cart.savedForLater.items;
export const selectWishlistItems = (state: RootState) => state.cart.wishlist.items;

export default cartSlice.reducer;
