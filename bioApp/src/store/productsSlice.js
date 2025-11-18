import { createSlice } from '@reduxjs/toolkit';
import { PRODUCTS } from '../data/products';

const initialState = {
  list: PRODUCTS,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts(state, action) {
      state.list = action.payload;
    },
  },
});

export const { setProducts } = productsSlice.actions;
export default productsSlice.reducer;