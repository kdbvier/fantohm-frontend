import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import {
  RangoClient,
} from "rango-sdk"

import { RootState } from "../store";
import { setAll } from "../helpers";
import { RANGO_API_KEY } from "../constants";

export const loadSwapMetaData = createAsyncThunk(
  "swap/loadMetaData",
  async () => {
    const rangoClient = new RangoClient(RANGO_API_KEY);
    let result = null;
    try {
      result = await rangoClient.getAllMetadata();
    } catch (e) {
      console.log(e);
    }
    return {
      value: result
    };
  },
);

const initialState = {
  loading: false,
  value: null
};

const swapSlice = createSlice({
  name: "swap",
  initialState,
  reducers: {
    fetchSwapSuccess(state, action) {
      setAll(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadSwapMetaData.pending, state => {
        state.loading = true;
      })
      .addCase(loadSwapMetaData.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(loadSwapMetaData.rejected, (state, {error}) => {
        state.loading = false;
        console.log(error);
      })
  },
});

export default swapSlice.reducer;

export const {fetchSwapSuccess} = swapSlice.actions;

const baseInfo = (state: RootState) => state.swap;

export const getSwapState = createSelector(baseInfo, swap => swap);
