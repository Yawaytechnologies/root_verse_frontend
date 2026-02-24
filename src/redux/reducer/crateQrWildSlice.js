import { createSlice } from "@reduxjs/toolkit";
import { createCrateQrWildBatch, fetchCrateQrWildDistricts } from "../action/crateQrWildActions";

const initialState = {
  districts: [],
  districtsLoading: false,
  districtsError: null,

  qrs: [],
  createLoading: false,
  createError: null,

  selectedQr: null,
};

const crateQrWildSlice = createSlice({
  name: "crateQrWild",
  initialState,
  reducers: {
    clearCrateQrWildStatus: (state) => {
      state.districtsError = null;
      state.createError = null;
    },
    clearCrateQrWildBatch: (state) => {
      state.qrs = [];
      state.selectedQr = null;
    },
    setSelectedCrateQrWild: (state, action) => {
      state.selectedQr = action.payload || null;
    },
  },
  extraReducers: (builder) => {
    builder
      // districts
      .addCase(fetchCrateQrWildDistricts.pending, (state) => {
        state.districtsLoading = true;
        state.districtsError = null;
      })
      .addCase(fetchCrateQrWildDistricts.fulfilled, (state, action) => {
        state.districtsLoading = false;
        state.districts = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCrateQrWildDistricts.rejected, (state, action) => {
        state.districtsLoading = false;
        state.districtsError = action.payload || "Failed to fetch districts";
      })

      // create batch
      .addCase(createCrateQrWildBatch.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createCrateQrWildBatch.fulfilled, (state, action) => {
        state.createLoading = false;
        state.qrs = Array.isArray(action.payload) ? action.payload : [];
        state.selectedQr = null;
      })
      .addCase(createCrateQrWildBatch.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || "Failed to create batch";
      });
  },
});

export const {
  clearCrateQrWildStatus,
  clearCrateQrWildBatch,
  setSelectedCrateQrWild,
} = crateQrWildSlice.actions;

// ✅ IMPORTANT: selectors must use state.crateQrWild (your store key)
export const selectCrateQrWildDistricts = (s) => s.crateQrWild?.districts || [];
export const selectCrateQrWildDistrictsLoading = (s) => !!s.crateQrWild?.districtsLoading;
export const selectCrateQrWildDistrictsError = (s) => s.crateQrWild?.districtsError || null;

export const selectCrateQrWildQrs = (s) => s.crateQrWild?.qrs || [];
export const selectCrateQrWildCreateLoading = (s) => !!s.crateQrWild?.createLoading;
export const selectCrateQrWildCreateError = (s) => s.crateQrWild?.createError || null;

export const selectSelectedCrateQrWild = (s) => s.crateQrWild?.selectedQr || null;

export default crateQrWildSlice.reducer;