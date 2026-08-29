import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../helper/AxiosInstance.js';
import * as Keychain from 'react-native-keychain';

const initialState = {
  loading: false,
  status: 'loading',
  userData: null,
  requestedUserData: null,
  userList: null,
};

export const userLogin = createAsyncThunk(
  'userLogin',
  async ({ mobileNo, password }) => {
    try {
      const response = await axiosInstance.get(
        `/Getlogin?Mobileno=${mobileNo}&Pwd=${password}&FCM=&typid=15&Comid=1`,
      );
      await Keychain.setGenericPassword(
        'user',
        JSON.stringify({
          EmpId: response.data[0].EmpId,
          Emp: response.data[0].Emp,
          UserType: response.data[0].UserType,
          flag: response.data[0].flag,
          LoginStatus: response.data[0].LoginStatus,
          FCM: response.data[0].FCM,
          StateName: response.data[0].StateName,
          StateCode: response.data[0].StateCode,
          Comid: response.data[0].Comid,
          CompanyName: response.data[0].CompanyName,
        }),
        {
          service: 'userData',
        },
      );

      await Keychain.setGenericPassword(
        'status',
        JSON.stringify({
          status: 'authenticated',
        }),
        {
          service: 'userAuth',
        },
      );
      return response.data[0];
    } catch (error) {
      throw error;
    }
  },
);

export const handleLogout = async () => {
  try {
    await Keychain.resetGenericPassword({ service: 'userData' });
    await Keychain.resetGenericPassword({ service: 'userAuth' });
  } catch (error) {
    throw error;
  }
};
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: state => {
      state.userData = null;
      state.status = 'unauthenticated';
    },
    setUser: (state, data) => {
      state.userData = data.payload.user;
      state.status = data.payload.auth.status;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(userLogin.pending, state => {
        state.loading = true;
        state.status = 'loading';
      })
      .addCase(userLogin.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.Status != 'Invalid User') {
          state.status = 'authenticated';
          state.userData = action.payload;
        } else {
          state.status = 'unauthenticated';
          state.userData = null;
        }
      })
      .addCase(userLogin.rejected, (state, action) => {
        state.loading = false;
        state.status = 'unauthenticated';
        state.userData = null;
      });
  },
});
export const { logoutUser, setUser } = authSlice.actions;
export default authSlice.reducer;
