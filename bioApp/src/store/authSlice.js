import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null, // { name, email }
  orders: [], // { id, items, total, date }
  wishlist: [], // productIds
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    register: (state, action) => {
      const { name, email } = action.payload;
      state.user = { name, email };
    },
    login: (state, action) => {
      const { email } = action.payload;
      state.user = { name: 'Usuario', email };
    },
    logout: (state) => {
      state.user = null;
    },
    addOrder: (state, action) => {
      state.orders.push(action.payload);
    },
    addToWishlist: (state, action) => {
      const id = action.payload;
      if (!state.wishlist.includes(id)) state.wishlist.push(id);
    },
    removeFromWishlist: (state, action) => {
      const id = action.payload;
      state.wishlist = state.wishlist.filter((w) => w !== id);
    },
  },
});

export const { register, login, logout, addOrder, addToWishlist, removeFromWishlist } = authSlice.actions;
export default authSlice.reducer;