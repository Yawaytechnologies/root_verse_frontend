// src/redux/reducer/cratePackerSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  createCratePacker,
  fetchCratePackers,
  fetchLocations,
} from "../action/cratepackerCreateActions";

const normalizeArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

const initialState = {
  items: [],
  listLoading: false,
  listError: null,

  createLoading: false,
  createError: null,
  created: null,

  // ✅ locations
  locations: [],
  locationsLoading: false,
  locationsError: null,
};

const cratePackerSlice = createSlice({
  name: "cratePacker",
  initialState,
  reducers: {
    clearCratePackerCreateState(state) {
      state.createLoading = false;
      state.createError = null;
      state.created = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // list
      .addCase(fetchCratePackers.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchCratePackers.fulfilled, (state, action) => {
        state.listLoading = false;
        state.items = normalizeArray(action.payload);
      })
      .addCase(fetchCratePackers.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload || "Failed to fetch";
      })

      // create
      .addCase(createCratePacker.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.created = null;
      })
      .addCase(createCratePacker.fulfilled, (state, action) => {
        state.createLoading = false;
        state.created = action.payload;

        const createdObj = action.payload?.data || action.payload;
        if (createdObj && typeof createdObj === "object") {
          state.items = [createdObj, ...state.items];
        }
      })
      .addCase(createCratePacker.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || "Failed to create";
      })

      // ✅ locations
      .addCase(fetchLocations.pending, (state) => {
        state.locationsLoading = true;
        state.locationsError = null;
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.locationsLoading = false;
        state.locations = normalizeArray(action.payload);
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.locationsLoading = false;
        state.locationsError = action.payload || "Failed to fetch locations";
      });
  },
});

export const { clearCratePackerCreateState } = cratePackerSlice.actions;

export default cratePackerSlice.reducer;

// selectors
export const selectCratePackers = (s) => s.cratePacker.items;
export const selectCratePackerListLoading = (s) => s.cratePacker.listLoading;
export const selectCratePackerListError = (s) => s.cratePacker.listError;

export const selectCratePackerCreateLoading = (s) => s.cratePacker.createLoading;
export const selectCratePackerCreateError = (s) => s.cratePacker.createError;
export const selectCratePackerCreated = (s) => s.cratePacker.created;

// ✅ locations selectors
export const selectLocations = (s) => s.cratePacker.locations;
export const selectLocationsLoading = (s) => s.cratePacker.locationsLoading;
export const selectLocationsError = (s) => s.cratePacker.locationsError;