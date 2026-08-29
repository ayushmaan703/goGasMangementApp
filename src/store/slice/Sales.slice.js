import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../helper/AxiosInstance.js';

const initialState = {
  loading: false,
  allSalesPersonList: null,
};

export const getAllSalesPerson = createAsyncThunk(
  'getAllSalesPerson',
  async comid => {
    try {
      const response = await axiosInstance.get(
        `/GetSalesPersonMaster?Comid=${comid}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getAllSalesPerson.pending, state => {
        state.loading = true;
      })
      .addCase(getAllSalesPerson.fulfilled, (state, action) => {
        state.loading = false;
        state.allSalesPersonList = action.payload;
      })
      .addCase(getAllSalesPerson.rejected, (state, action) => {
        state.loading = false;
        state.allSalesPersonList = null;
      });
  },
});
export default salesSlice.reducer;
