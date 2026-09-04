import { configureStore } from '@reduxjs/toolkit';
import AuthSliceReducer from './slice/Auth.slice.js';
import CustomerSliceReducer from './slice/Customer.slice.js';
import AdminSliceReducer from './slice/Admin.slice.js';
import salesSliceReducer from './slice/Sales.slice.js';
import dailyEntryReducer from './slice/DailyStockEntry.slice.js';
import dailyPaymentReducer from './slice/DailyPayment.slice.js';
import expenseReducer from './slice/Expence.slice.js';
import orderingCustomerReducer from './slice/OrderingCustomer.slice.js';

export const store = configureStore({
  reducer: {
    auth: AuthSliceReducer,
    customer: CustomerSliceReducer,
    admin: AdminSliceReducer,
    sales: salesSliceReducer,
    dailyEntry: dailyEntryReducer,
    dailyPayment: dailyPaymentReducer,
    expense: expenseReducer,
    orderingCustomer: orderingCustomerReducer,
  },
});
