import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../helper/AxiosInstance.js';

const initialState = {
  loading: false,
  expenseMaster: null,
  dailyExpenseList: null,
};

export const getExpenseMaster = createAsyncThunk(
  'getExpenseMaster',
  async data => {
    try {
      const response = await axiosInstance.get(
        `/GetExpenceMaster?Comid=${data}&typ=0`,
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const addDailyExpense = createAsyncThunk(
  'addDailyExpense',
  async data => {
    try {
      const response = await axiosInstance.get(
        `/DailyExpenceDetail?EntryId=0&PayDate=${data.PayDate}&ExpenceId=${data.ExpenceId}&Amount=${data.Amount}&Comid=${data.Comid}&Uid=${data.Uid}&PayMode=${data.PayMode}`,
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const editDailyExpense = createAsyncThunk(
  'editDailyExpense',
  async data => {
    try {
      const response = await axiosInstance.get(
        `/DailyExpenceDetail?EntryId=${data.EntryId}&PayDate=${data.PayDate}&ExpenceId=${data.ExpenceId}&Amount=${data.Amount}&Comid=${data.Comid}&Uid=${data.Uid}&PayMode=${data.PayMode}`,
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const getDailyExpense = createAsyncThunk(
  'getDailyExpense',
  async data => {
    try {
      const response = await axiosInstance.get(
        `/GetDailyExpenceDetail?Comid=${data.Comid}&FromDate=${data.FromDate}&Todate=${data.Todate}&PendingStatus=${data.PendingStatus}&AdminApproval=${data.AdminApproval}`,
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const submitDailyExpense = createAsyncThunk(
  'submitDailyExpense',
  async data => {
    try {
      const response = await axiosInstance.get(
        `/DailyExpenceDetail_Submit?PayDate=${data.PayDate}&TotalAmount=${data.TotalAmount}&Comid=${data.Comid}`,
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const confirmDailyExpense = createAsyncThunk(
  'confirmDailyExpense',
  async data => {
    try {
      const response = await axiosInstance.get(
        `/DailyExpenceDetail_Confirm?transid=0&EntryId=${data.EntryId}&PayDate=${data.PayDate}&CustomerId=${data.CustomerId}&Comid=${data.Comid}&Uid=${data.Uid}&PayMode=${data.PayMode}&Amount=${data.Amount}`,
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const editConfirmDailyExpense = createAsyncThunk(
  'editConfirmDailyExpense',
  async data => {
    try {
      const response = await axiosInstance.get(
        `/DailyExpenceDetail_Confirm?transid=${data.transid}&EntryId=${data.EntryId}&PayDate=${data.PayDate}&CustomerId=${data.CustomerId}&Comid=${data.Comid}&Uid=${data.Uid}&PayMode=${data.PayMode}&Amount=${data.Amount}`,
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const delDailyExpenseEntry = createAsyncThunk(
  'delDailyExpenseEntry',
  async ({ comid, id }) => {
    try {
      const res = await axiosInstance.get(
        `/RemoveEntry?Comid=${comid}&DelId=${id}&type=4`,
      );
      return res.data;
    } catch (err) {
      throw err;
    }
  },
);

const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {},

  extraReducers: builder => {
    builder
      .addCase(getExpenseMaster.pending, state => {
        state.loading = true;
      })
      .addCase(getExpenseMaster.fulfilled, (state, action) => {
        state.loading = false;
        state.expenseMaster = action.payload;
      })
      .addCase(getExpenseMaster.rejected, state => {
        state.loading = false;
        state.expenseMaster = null;
      })
      .addCase(addDailyExpense.pending, state => {
        state.loading = true;
      })
      .addCase(addDailyExpense.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(addDailyExpense.rejected, state => {
        state.loading = false;
      })
      .addCase(editDailyExpense.pending, state => {
        state.loading = true;
      })
      .addCase(editDailyExpense.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(editDailyExpense.rejected, state => {
        state.loading = false;
      })
      .addCase(getDailyExpense.pending, state => {
        state.loading = true;
      })
      .addCase(getDailyExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.dailyExpenseList = action.payload;
      })
      .addCase(getDailyExpense.rejected, state => {
        state.loading = false;
        state.dailyExpenseList = null;
      })
      .addCase(submitDailyExpense.pending, state => {
        state.loading = true;
      })
      .addCase(submitDailyExpense.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(submitDailyExpense.rejected, state => {
        state.loading = false;
      })
      .addCase(confirmDailyExpense.pending, state => {
        state.loading = true;
      })
      .addCase(confirmDailyExpense.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(confirmDailyExpense.rejected, state => {
        state.loading = false;
      })
      .addCase(editConfirmDailyExpense.pending, state => {
        state.loading = true;
      })
      .addCase(editConfirmDailyExpense.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(editConfirmDailyExpense.rejected, state => {
        state.loading = false;
      })
      .addCase(delDailyExpenseEntry.pending, state => {
        state.loading = true;
      })
      .addCase(delDailyExpenseEntry.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(delDailyExpenseEntry.rejected, state => {
        state.loading = false;
      });
  },
});

export default expenseSlice.reducer;
