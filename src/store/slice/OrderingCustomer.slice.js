import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../helper/AxiosInstance.js';

const initialState = {
  loading: false,
  customerOrderList: null,
};

export const customerOrderEntry = createAsyncThunk(
  'customerOrderEntry',
  async data => {
    try {
      const response = await axiosInstance.get(
        `/CustomerOrderEntry?EntryId=0&OrderDate=${data.OrderDate}&CustomerId=${data.CustomerId}&OrderCycQty=${data.OrderCycQty}&Comid=${data.Comid}&Uid=${data.Uid}`,
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const editCustomerOrderEntry = createAsyncThunk(
  'editCustomerOrderEntry',
  async data => {
    try {
      const response = await axiosInstance.get(
        `/CustomerOrderEntry?EntryId=${data.EntryId}&OrderDate=${data.OrderDate}&CustomerId=${data.CustomerId}&OrderCycQty=${data.OrderCycQty}&Comid=${data.Comid}&Uid=${data.Uid}`,
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const getCustomerOrderEntry = createAsyncThunk(
  'getCustomerOrderEntry',
  async data => {
    try {
      const response = await axiosInstance.get(
        `/GetCustomerOrderEntry?FromDate=${data.FromDate}&Todate=${data.Todate}&Comid=${data.Comid}&OrderStatus=${data.OrderStatus}&CustomerId=${data.CustomerId}`,
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const customerOrderEntryDone = createAsyncThunk(
  'customerOrderEntryDone',
  async data => {
    try {
      const response = await axiosInstance.get(
        `/CustomerOrderEntry_Done?EntryId=${data.EntryId}&Comid=${data.Comid}&Uid=${data.Uid}&OrderCycQty=${data.OrderCycQty}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

const orderingCustomerSlice = createSlice({
  name: 'orderingCustomer',
  initialState,
  reducers: {},

  extraReducers: builder => {
    builder
      .addCase(customerOrderEntry.pending, state => {
        state.loading = true;
      })
      .addCase(customerOrderEntry.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(customerOrderEntry.rejected, state => {
        state.loading = false;
      })
      .addCase(editCustomerOrderEntry.pending, state => {
        state.loading = true;
      })
      .addCase(editCustomerOrderEntry.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(editCustomerOrderEntry.rejected, state => {
        state.loading = false;
      })
      .addCase(getCustomerOrderEntry.pending, state => {
        state.loading = true;
      })
      .addCase(getCustomerOrderEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.customerOrderList = action.payload;
      })
      .addCase(getCustomerOrderEntry.rejected, state => {
        state.loading = false;
        state.customerOrderList = null;
      })
      .addCase(customerOrderEntryDone.pending, state => {
        state.loading = true;
      })
      .addCase(customerOrderEntryDone.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(customerOrderEntryDone.rejected, state => {
        state.loading = false;
      });
  },
});

export default orderingCustomerSlice.reducer;
