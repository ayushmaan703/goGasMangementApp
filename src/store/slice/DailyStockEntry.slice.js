import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../helper/AxiosInstance.js';
import * as Keychain from 'react-native-keychain';

const initialState = {
  loading: false,
  paymentMethodList: null,
  stockEntryList: null,
};

export const getPaymentMethod = createAsyncThunk(
  'getPaymentMethod',
  async comid => {
    try {
      const response = await axiosInstance.get(
        `/GetPaymentMethodMaster?Comid=${comid}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const createDailyStockEntry = createAsyncThunk(
  'createDailyStockEntry',
  async data => {
    try {
      const response = await axiosInstance.get(
        `/DailyStockEntry?EntryId=0&OrderDate=${data.OrderDate}&CustomerId=${data.CustomerId}&CycIn=${data.CycIn}&CycOut=${data.CycOut}&BalCyc=${data.BalCyc}&Regulator=${data.Regulator}&PayMode=${data.PayMode}&Amount=${data.Amount}&Comid=${data.Comid}&Uid=${data.Uid}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const editDailyStockEntry = createAsyncThunk(
  'editDailyStockEntry',
  async data => {
    try {
      const response = await axiosInstance.get(
        `/DailyStockEntry?EntryId=${data.EntryId}&OrderDate=${data.OrderDate}&CustomerId=${data.CustomerId}&CycIn=${data.CycIn}&CycOut=${data.CycOut}&BalCyc=${data.BalCyc}&Regulator=${data.Regulator}&PayMode=${data.PayMode}&Amount=${data.Amount}&Comid=${data.Comid}&Uid=${data.Uid}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const getDailyStockEntry = createAsyncThunk(
  'getDailyStockEntry',
  async data => {
    try {
      const response = await axiosInstance.get(
        `/GetDailyStockEntry?Comid=${data.Comid}&FromDate=${data.FromDate}&Todate=${data.Todate}&PendingStatus=${data.PendingStatus}&AdminApproval=${data.AdminApproval}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const submitDailyStockEntry = createAsyncThunk(
  'submitDailyStockEntry',
  async data => {
    try {
      const response = await axiosInstance.get(
        `/DailyStockEntry_Submit?PayDate=${data.PayDate}&BalanceCyc=${data.BalanceCyc}&BalanceEmpty=${data.BalanceEmpty}&TotalCash=${data.TotalCash}&Comid=${data.Comid}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);



const dailyEntrySlice = createSlice({
  name: 'dailyEntry',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getPaymentMethod.pending, state => {
        state.loading = true;
      })
      .addCase(getPaymentMethod.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethodList = action.payload;
      })
      .addCase(getPaymentMethod.rejected, (state, action) => {
        state.loading = false;
        state.paymentMethodList = null;
      })
      .addCase(createDailyStockEntry.pending, state => {
        state.loading = true;
      })
      .addCase(createDailyStockEntry.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createDailyStockEntry.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(editDailyStockEntry.pending, state => {
        state.loading = true;
      })
      .addCase(editDailyStockEntry.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(editDailyStockEntry.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(getDailyStockEntry.pending, state => {
        state.loading = true;
      })
      .addCase(getDailyStockEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.stockEntryList = action.payload;
      })
      .addCase(getDailyStockEntry.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(submitDailyStockEntry.pending, state => {
        state.loading = true;
      })
      .addCase(submitDailyStockEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.stockEntryList = action.payload;
      })
      .addCase(submitDailyStockEntry.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export default dailyEntrySlice.reducer;
