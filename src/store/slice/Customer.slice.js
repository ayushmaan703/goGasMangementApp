import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../helper/AxiosInstance.js';
import Toast from 'react-native-toast-message';

const initialState = {
  loading: false,
  status: false,
  customerList: null,
  localityList: null,
  stateList: null,
};

export const getAllCustomers = createAsyncThunk('getAllCustomers', async () => {
  try {
    const response = await axiosInstance.get(
      `/GetCustomerMaster?Comid=1&typ=0`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
});

export const getLocality = createAsyncThunk('getLocality', async () => {
  try {
    const response = await axiosInstance.get(`/GetLocalityMaster?Comid=1`);
    return response.data;
  } catch (error) {
    throw error;
  }
});

export const getState = createAsyncThunk('getState', async () => {
  try {
    const response = await axiosInstance.get(`/GetStateMaster?Comid=1`);
    return response.data;
  } catch (error) {
    throw error;
  }
});

export const createCustomer = createAsyncThunk(
  'createCustomer',
  async customerData => {
    try {
      const response = await axiosInstance.get(
        `/AddAccount?AccountId=0&CustomerName=${customerData.CustomerName}&StateName=${customerData.StateName}&StateCode=${customerData.StateCode}&LocatlityId=${customerData.LocatlityId}&SalespersonId=${customerData.SalespersonId}&ContactPerson=${customerData.ContactPerson}&ContactNo=${customerData.MobileNo}&Comid=1`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const editCustomer = createAsyncThunk(
  'editCustomer',
  async customerData => {
    try {
      const response = await axiosInstance.get(
        `/AddAccount?AccountId=${customerData.CustomerId}&CustomerName=${customerData.CustomerName}&StateName=${customerData.StateName}&StateCode=${customerData.StateCode}&LocatlityId=${customerData.LocatlityId}&SalespersonId=${customerData.SalespersonId}&ContactPerson=${customerData.ContactPerson}&ContactNo=${customerData.ContactNo}&Comid=1`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

//these are old api
export const deleteCustomer = createAsyncThunk(
  'deleteCustomer',
  async customerId => {
    try {
      const response = await axiosInstance.delete('/customer/deleteCustomer', {
        data: customerId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const togglePaidStatus = createAsyncThunk(
  'togglePaidStatus',
  async customerId => {

    try {
      const response = await axiosInstance.patch('/customer/togglePaidStatus', {
        params: { customerId },
      });
      return response.data;
    } catch (error) {


      Toast.show({
        type: 'customNotificationError',
        text1: error?.data || 'Error Occured',
        visibilityTime: 1000,
      });
      throw error;
    }
  },
);

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getAllCustomers.pending, state => {
        state.loading = true;
      })
      .addCase(getAllCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customerList = action.payload;
      })
      .addCase(getAllCustomers.rejected, (state, action) => {
        state.loading = false;
        state.customerList = null;
      })
      .addCase(getLocality.pending, state => {
        state.loading = true;
      })
      .addCase(getLocality.fulfilled, (state, action) => {
        state.loading = false;
        state.localityList = action.payload;
      })
      .addCase(getLocality.rejected, (state, action) => {
        state.loading = false;
        state.localityList = null;
      })
      .addCase(getState.pending, state => {
        state.loading = true;
      })
      .addCase(getState.fulfilled, (state, action) => {
        state.loading = false;
        state.stateList = action.payload;
      })
      .addCase(getState.rejected, (state, action) => {
        state.loading = false;
        state.stateList = null;
      })
      .addCase(editCustomer.pending, state => {
        state.loading = true;
      })
      .addCase(editCustomer.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(editCustomer.rejected, (state, action) => {
        state.loading = false;
      })

      //these are old api reducres
      .addCase(deleteCustomer.pending, state => {
        state.loading = true;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customerList = state.customerList.filter(
          customer => customer._id !== action.meta.arg,
        );
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(togglePaidStatus.pending, state => {
        state.loading = true;
      })
      .addCase(togglePaidStatus.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(togglePaidStatus.rejected, (state, action) => {
        state.loading = false;
      });
  },
});
export default customerSlice.reducer;
