import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./features/cartSlice";
import filtersReducer from "./features/filtersSlice";
import itemsReducer from "./features/itemsSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    filters: filtersReducer,
    items: itemsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
