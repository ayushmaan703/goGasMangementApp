import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axiosInstance from '../../helper/AxiosInstance.js';

const initialState = {
  loading: false,
  customerList: null,
};

export const verifyCustomers = createAsyncThunk(
  'verifyCustomers',
  async data => {
    try {
      const response = await axiosInstance.post('/admin/verifyCustomer', data);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
);

export const registerAdmin = createAsyncThunk('registerAdmin', async data => {
  try {
    const response = await axiosInstance.post('/admin/registerAdmin', data);
    return response.data.data;
  } catch (error) {
    throw error;
  }
});

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
        state.customerList = action.payload;
      })
      .addCase(verifyCustomers.rejected, (state, action) => {
        state.loading = false;
        state.customerList = null;
      })
      .addCase(registerAdmin.pending, state => {
        state.loading = true;
      })
      .addCase(registerAdmin.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(registerAdmin.rejected, (state, action) => {
        state.loading = false;
      });
  },
});
export default adminSlice.reducer;
