import { configureStore } from "@reduxjs/toolkit";
import accountReducer from "./slices/AccountSlice";
import bondingReducer from "./slices/BondSlice";
import investmentsReducer from "./slices/InvestmentSlice";
import tokenPriceReducer from "./slices/TokenPriceSlice";
import globalbondingReducer from "./slices/GlobalBondSlice";
import appReducer from "./slices/AppSlice";
import pendingTransactionsReducer from "./slices/PendingTxnsSlice";
import poolDataReducer from "./slices/PoolThunk";
import lusdDataReducer from "./slices/LusdSlice";
import messagesReducer from "./slices/MessagesSlice";
import networkReducer from "./slices/NetworkSlice";
import swapReducer from "./slices/SwapSlice";
// reducers are named automatically based on the name field in the slice
// exported in slice files by default as nameOfSlice.reducer

const store = configureStore({
  reducer: {
    //   we'll have state.account, state.bonding, etc, each handled by the corresponding
    // reducer imported from the slice file
    account: accountReducer,
    bonding: bondingReducer,
    globalbonding: globalbondingReducer,
    investments: investmentsReducer,
    tokenPrices: tokenPriceReducer,
    app: appReducer,
    networks: networkReducer,
    pendingTransactions: pendingTransactionsReducer,
    poolData: poolDataReducer,
    lusdData: lusdDataReducer,
    messages: messagesReducer,
    swap: swapReducer
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
