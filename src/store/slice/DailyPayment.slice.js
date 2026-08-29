import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../helper/AxiosInstance.js';
import * as Keychain from 'react-native-keychain';

const initialState = {
  loading: false,
  paymentList: null,
};

export const createDailyPayment = createAsyncThunk(
  'createDailyPayment',
  async data => {
    try {
      const response = await axiosInstance.get(
        `/DailyPaymentDetail?EntryId=0&PayDate=${data.PayDate}&CustomerId=${data.CustomerId}&Amount=${data.Amount}&Comid=${data.Comid}&Uid=${data.Uid}&PayMode=${data.PayMode}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const editDailyPayment = createAsyncThunk(
  'editDailyPayment',
  async data => {
    try {
      const response = await axiosInstance.get(
        `/DailyPaymentDetail?EntryId=${data.EntryId}&PayDate=${data.PayDate}&CustomerId=${data.CustomerId}&Amount=${data.Amount}&Comid=${data.Comid}&Uid=${data.Uid}&PayMode=${data.PayMode}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const getDailyPayment = createAsyncThunk(
  'getDailyPayment',
  async data => {
    try {
      const response = await axiosInstance.get(
        `/GetDailyPaymentDetail?Comid=${data.Comid}&FromDate=${data.FromDate}&Todate=${data.Todate}&PendingStatus=${data.PendingStatus}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const submitDailyPayment = createAsyncThunk(
  'submitDailyPayment',
  async data => {
    try {
      const response = await axiosInstance.get(
        `/DailyPaymentDetail_Submit?PayDate=${data.PayDate}&TotalAmount=${data.TotalAmount}&Comid=${data.Comid}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

const dailyPaymentSlice = createSlice({
  name: 'dailyPayment',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(createDailyPayment.pending, state => {
        state.loading = true;
      })
      .addCase(createDailyPayment.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createDailyPayment.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(editDailyPayment.pending, state => {
        state.loading = true;
      })
      .addCase(editDailyPayment.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(editDailyPayment.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(getDailyPayment.pending, state => {
        state.loading = true;
      })
      .addCase(getDailyPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentList = action.payload;
      })
      .addCase(getDailyPayment.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(submitDailyPayment.pending, state => {
        state.loading = true;
      })
      .addCase(submitDailyPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentList = action.payload;
      })
      .addCase(submitDailyPayment.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export default dailyPaymentSlice.reducer;
