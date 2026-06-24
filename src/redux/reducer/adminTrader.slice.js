import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAdminTraders,
  fetchAdminTraderById,
} from "../action/adminTrader.actions";
import {
  getTraderStatusKey,
} from "../services/adminTrader.service";

const initialState = {
  items: [],
  selectedTrader: null,

  loading: false,
  detailLoading: false,

  error: "",
  detailError: "",

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
      });
  },
});

export const {
  setTraderSearch,
  setTraderStatusFilter,
  clearSelectedTrader,
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