import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAdminTraders,
  fetchAdminTraderById,
  updateAdminTraderStatus,
} from "../action/adminTrader.actions";

import { getTraderStatusKey } from "../services/adminTrader.service";

const initialState = {
  items: [],
  selectedTrader: null,

  loading: false,
  detailLoading: false,
  statusUpdating: {},

  error: "",
  detailError: "",
  statusError: "",

  search: "",
  statusFilter: "all",
};

const adminTraderSlice = createSlice({
  name: "adminTrader",
  initialState,

  reducers: {
    setTraderSearch(state, action) {
      state.search = action.payload;
    },

    setTraderStatusFilter(state, action) {
      state.statusFilter = action.payload;
    },

    clearSelectedTrader(state) {
      state.selectedTrader = null;
      state.detailError = "";
    },

    clearTraderStatusError(state) {
      state.statusError = "";
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminTraders.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchAdminTraders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchAdminTraders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch traders";
      })

      .addCase(fetchAdminTraderById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = "";
        state.selectedTrader = null;
      })
      .addCase(fetchAdminTraderById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedTrader = action.payload;
      })
      .addCase(fetchAdminTraderById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload || "Failed to fetch trader details";
      })

      .addCase(updateAdminTraderStatus.pending, (state, action) => {
        const traderId = action.meta.arg.traderId;
        state.statusUpdating[traderId] = true;
        state.statusError = "";
      })
      .addCase(updateAdminTraderStatus.fulfilled, (state, action) => {
        const { traderId, trader, status } = action.payload;

        delete state.statusUpdating[traderId];

        const finalStatus =
          String(status).toLowerCase() === "approved"
            ? "APPROVED"
            : "REJECTED";

        const fallbackTrader = {
          id: traderId,
          status: finalStatus,
          approval_status: finalStatus,
          verification_status: finalStatus,
          is_active: finalStatus === "APPROVED",
        };

        const updatedTrader = trader || fallbackTrader;

        const index = state.items.findIndex(
          (item) => String(item.id) === String(traderId)
        );

        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...updatedTrader,
          };
        }

        if (
          state.selectedTrader &&
          String(state.selectedTrader.id) === String(traderId)
        ) {
          state.selectedTrader = {
            ...state.selectedTrader,
            ...updatedTrader,
          };
        }
      })
      .addCase(updateAdminTraderStatus.rejected, (state, action) => {
        const traderId = action.meta.arg.traderId;
        delete state.statusUpdating[traderId];

        state.statusError =
          action.payload || "Failed to update trader status";
      });
  },
});

export const {
  setTraderSearch,
  setTraderStatusFilter,
  clearSelectedTrader,
  clearTraderStatusError,
} = adminTraderSlice.actions;

export const selectAdminTraderState = (state) => state.adminTrader;

export const selectTraderStats = (state) => {
  const traders = state.adminTrader.items || [];

  return {
    total: traders.length,
    pending: traders.filter((item) => getTraderStatusKey(item) === "pending")
      .length,
    approved: traders.filter((item) => getTraderStatusKey(item) === "approved")
      .length,
    rejected: traders.filter((item) => getTraderStatusKey(item) === "rejected")
      .length,
  };
};

export const selectFilteredTraders = (state) => {
  const { items, search, statusFilter } = state.adminTrader;

  const keyword = String(search || "").toLowerCase().trim();

  return (items || []).filter((trader) => {
    const districts = Array.isArray(trader.operational_districts)
      ? trader.operational_districts.join(", ")
      : "";

    const searchableText = [
      trader.trader_name,
      trader.trader_code,
      trader.mobile,
      trader.email,
      trader.trader_type,
      districts,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = !keyword || searchableText.includes(keyword);

    const matchesStatus =
      statusFilter === "all" || getTraderStatusKey(trader) === statusFilter;

    return matchesSearch && matchesStatus;
  });
};

export default adminTraderSlice.reducer;