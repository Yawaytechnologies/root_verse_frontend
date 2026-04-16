// crateListingSlice.js — Redux slice for crate listing state

import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCratesAction,
  fetchCrateDetailAction,
  overrideCrateStatusAction,
} from "../action/crateListingActions";

const initialState = {
  // List state
  crates: [],
  listLoading: false,
  listError: null,

  // Filters & pagination
  filters: {
    status: "",
    date: "",
    centre_id: "",
    transport_operator_id: "",
    destination_name: "",
    page: 1,
    page_size: 20,
  },

  // Detail / View modal state
  selectedCrate: null,
  detailLoading: false,
  detailError: null,

  // Override status state
  overrideLoading: false,
  overrideError: null,
  overrideSuccess: false,
};

const crateListingSlice = createSlice({
  name: "crateListing",
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    setPage(state, action) {
      state.filters.page = action.payload;
    },
    clearSelectedCrate(state) {
      state.selectedCrate = null;
      state.detailError = null;
    },
    clearOverrideState(state) {
      state.overrideError = null;
      state.overrideSuccess = false;
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    // ── Fetch Crates List ─────────────────────────────────────────────────
    builder
      .addCase(fetchCratesAction.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchCratesAction.fulfilled, (state, action) => {
        state.listLoading = false;
        state.crates = action.payload?.data ?? action.payload ?? [];
      })
      .addCase(fetchCratesAction.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
        state.crates = [];
      });

    // ── Fetch Crate Detail ────────────────────────────────────────────────
    builder
      .addCase(fetchCrateDetailAction.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
        state.selectedCrate = null;
      })
      .addCase(fetchCrateDetailAction.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedCrate = action.payload?.data ?? action.payload;
      })
      .addCase(fetchCrateDetailAction.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      });

    // ── Override Crate Status ─────────────────────────────────────────────
    builder
      .addCase(overrideCrateStatusAction.pending, (state) => {
        state.overrideLoading = true;
        state.overrideError = null;
        state.overrideSuccess = false;
      })
      .addCase(overrideCrateStatusAction.fulfilled, (state, action) => {
        state.overrideLoading = false;
        state.overrideSuccess = true;
        const updated = action.payload?.data ?? action.payload;
        if (updated?.id) {
          state.crates = state.crates.map((c) =>
            c.id === updated.id ? { ...c, ...updated } : c
          );
          if (state.selectedCrate?.id === updated.id) {
            state.selectedCrate = { ...state.selectedCrate, ...updated };
          }
        }
      })
      .addCase(overrideCrateStatusAction.rejected, (state, action) => {
        state.overrideLoading = false;
        state.overrideError = action.payload;
      });
  },
});

export const {
  setFilters,
  setPage,
  clearSelectedCrate,
  clearOverrideState,
  resetFilters,
} = crateListingSlice.actions;

// Selectors
export const selectCrates = (state) => state.crateListing.crates;
export const selectCrateListLoading = (state) => state.crateListing.listLoading;
export const selectCrateListError = (state) => state.crateListing.listError;
export const selectCrateFilters = (state) => state.crateListing.filters;
export const selectSelectedCrate = (state) => state.crateListing.selectedCrate;
export const selectCrateDetailLoading = (state) =>
  state.crateListing.detailLoading;
export const selectCrateDetailError = (state) => state.crateListing.detailError;
export const selectOverrideLoading = (state) => state.crateListing.overrideLoading;
export const selectOverrideError = (state) => state.crateListing.overrideError;
export const selectOverrideSuccess = (state) =>
  state.crateListing.overrideSuccess;

export default crateListingSlice.reducer;