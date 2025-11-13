import { createSlice } from '@reduxjs/toolkit';
import { PRODUCTS } from '../data/products';

const initialState = {
  list: PRODUCTS,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
});

export default productsSlice.reducer;