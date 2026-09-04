import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../helper/AxiosInstance.js';

const initialState = {
  loading: false,
  customerList: null,
};

export const verifyCustomers = createAsyncThunk(
  'verifyCustomers',
  async data => {
    try {
      const response = await axiosInstance.get(
        `/AccountApproved?AccountId=${data.AccountId}&GSTNo=${data.GSTNo}&GstSlab=${data.GstSlab}&OpeningBal=${data.OpeningBal}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(verifyCustomers.pending, state => {
        state.loading = true;
      })
      .addCase(verifyCustomers.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(verifyCustomers.rejected, (state, action) => {
        state.loading = false;
        state.customerList = null;
      })
  },
});
export default adminSlice.reducer;
