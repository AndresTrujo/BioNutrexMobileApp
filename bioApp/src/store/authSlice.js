import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null, // { name, email }
  tokens: null, // { access, refresh }
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
      const { name, email, tokens } = action.payload;
      state.user = { name, email };
      if (tokens) state.tokens = tokens;
    },
    setAuth: (state, action) => {
      const { user, tokens } = action.payload;
      state.user = user || state.user;
      state.tokens = tokens || state.tokens;
    },
    logout: (state) => {
      state.user = null;
      state.tokens = null;
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

export const { register, login, setAuth, logout, addOrder, addToWishlist, removeFromWishlist } = authSlice.actions;
export default authSlice.reducer;