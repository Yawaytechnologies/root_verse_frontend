import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  fetchTradersApi,
  fetchTraderByIdApi,
  updateTraderStatusApi,
} from "../services/adminTrader.service";

export const fetchAdminTraders = createAsyncThunk(
  "adminTrader/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchTradersApi();
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch traders");
    }
  }
);

export const fetchAdminTraderById = createAsyncThunk(
  "adminTrader/fetchById",
  async (traderId, { rejectWithValue }) => {
    try {
      return await fetchTraderByIdApi(traderId);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch trader details");
    }
  }
);

export const updateAdminTraderStatus = createAsyncThunk(
  "adminTrader/updateStatus",
  async ({ traderId, status }, { rejectWithValue }) => {
    try {
      const trader = await updateTraderStatusApi(traderId, status);

      return {
        traderId,
        status,
        trader,
      };
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to update trader status"
      );
    }
  }
);