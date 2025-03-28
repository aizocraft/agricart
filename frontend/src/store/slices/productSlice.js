import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch Products with Optional Filters
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const { keyword, minPrice, maxPrice } = filters;
      let url = 'http://localhost:5000/api/products/search?';

      // Append filters if available
      if (keyword) url += `keyword=${encodeURIComponent(keyword)}&`;
      if (minPrice) url += `minPrice=${minPrice}&`;
      if (maxPrice) url += `maxPrice=${maxPrice}`;

      const { data } = await axios.get(url);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Product Slice
const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;
