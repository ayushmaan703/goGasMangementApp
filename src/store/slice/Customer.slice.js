import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../helper/AxiosInstance.js';
import Toast from 'react-native-toast-message';

const initialState = {
  loading: false,
  status: false,
  customerList: null,
  localityList: null,
  stateList: null,
  customerData: null,
};

export const getAllCustomers = createAsyncThunk(
  'getAllCustomers',
  async comid => {
    try {
      const response = await axiosInstance.get(
        `/GetCustomerMaster?Comid=${comid}&typ=0`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const getCustomers = createAsyncThunk(
  'getCustomers',
  async ({ comid, id }) => {
    try {
      const response = await axiosInstance.get(
        `/GetCustomerMaster_CustomerWise?Comid=${comid}&typ=0&CustId=${id}`,
      );
      return response.data[0];
    } catch (error) {
      throw error;
    }
  },
);

export const getLocality = createAsyncThunk('getLocality', async comid => {
  try {
    const response = await axiosInstance.get(
      `/GetLocalityMaster?Comid=${comid}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
});

export const getState = createAsyncThunk('getState', async comid => {
  try {
    const response = await axiosInstance.get(`/GetStateMaster?Comid=${comid}`);
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
        `/AddAccount?AccountId=0&CustomerName=${customerData.CustomerName}&StateName=${customerData.StateName}&StateCode=${customerData.StateCode}&LocatlityId=${customerData.LocatlityId}&SalespersonId=${customerData.SalespersonId}&ContactPerson=${customerData.ContactPerson}&ContactNo=${customerData.MobileNo}&Comid=${customerData.comid}&custImg=${customerData.custImg}`,
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
        `/AddAccount?AccountId=${customerData.CustomerId}&CustomerName=${customerData.CustomerName}&StateName=${customerData.StateName}&StateCode=${customerData.StateCode}&LocatlityId=${customerData.LocatlityId}&SalespersonId=${customerData.SalespersonId}&ContactPerson=${customerData.ContactPerson}&ContactNo=${customerData.ContactNo}&Comid=${customerData.comid}&custImg=${customerData.custImg}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const delCustomer = createAsyncThunk(
  'delCustomer',
  async ({ comid, id }) => {
    try {
      const res = await axiosInstance.get(
        `/RemoveEntry?Comid=${comid}&DelId=${id}&type=1`,
      );
      return res.data;
    } catch (err) {
      throw err;
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
      .addCase(getCustomers.pending, state => {
        state.loading = true;
      })
      .addCase(getCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customerData = action.payload;
      })
      .addCase(getCustomers.rejected, (state, action) => {
        state.loading = false;
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
      .addCase(delCustomer.pending, state => {
        state.loading = true;
      })
      .addCase(delCustomer.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(delCustomer.rejected, (state, action) => {
        state.loading = false;
      });
  },
});
export default customerSlice.reducer;
