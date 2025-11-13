import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // { productId, quantity }
  shipping: 'standard', // 'standard' | 'express' | 'free'
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { productId } = action.payload;
      const existing = state.items.find((i) => i.productId === productId);
      if (existing) existing.quantity += 1;
      else state.items.push({ productId, quantity: 1 });
    },
    removeFromCart: (state, action) => {
      const { productId } = action.payload;
      state.items = state.items.filter((i) => i.productId !== productId);
    },
    setQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((i) => i.productId === productId);
      if (item) item.quantity = quantity;
    },
    setShipping: (state, action) => {
      state.shipping = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, setQuantity, setShipping, clearCart } = cartSlice.actions;
export default cartSlice.reducer;