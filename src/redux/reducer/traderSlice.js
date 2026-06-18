// src/redux/reducer/traderSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchTraderOrganizations,
  changeTraderStatus,
  createTraderOrganization,
} from "../action/traderAction";

function normalizeTraderList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.traders)) return response.traders;
  if (Array.isArray(response?.data?.traders)) return response.data.traders;
  return [];
}

const initialState = {
  traders: [],
  loading: false,
  actionLoading: false,
  actionLoadingId: null,
  createLoading: false,
  error: null,
  successMessage: "",
};

const traderSlice = createSlice({
  name: "trader",
  initialState,
  reducers: {
    clearTraderError: (state) => {
      state.error = null;
    },
    clearTraderSuccess: (state) => {
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // GET TRADERS
      .addCase(fetchTraderOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTraderOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.traders = normalizeTraderList(action.payload);
      })
      .addCase(fetchTraderOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch traders";
      })

      // PATCH TRADER STATUS
      .addCase(changeTraderStatus.pending, (state, action) => {
        state.actionLoading = true;
        state.actionLoadingId = action.meta.arg?.traderId || null;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(changeTraderStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionLoadingId = null;
        state.successMessage =
          action.payload?.message || "Trader status updated successfully";
      })
      .addCase(changeTraderStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionLoadingId = null;
        state.error = action.payload || "Failed to update trader status";
      })

      // CREATE TRADER
      .addCase(createTraderOrganization.pending, (state) => {
        state.createLoading = true;
        state.error = null;
        state.successMessage = "";
      })
      .addCase(createTraderOrganization.fulfilled, (state, action) => {
        state.createLoading = false;
        state.successMessage =
          action.payload?.message || "Trader created successfully";
      })
      .addCase(createTraderOrganization.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload || "Failed to create trader";
      });
  },
});

export const { clearTraderError, clearTraderSuccess } = traderSlice.actions;

export default traderSlice.reducer;