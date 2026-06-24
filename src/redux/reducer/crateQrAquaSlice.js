import { createSlice } from "@reduxjs/toolkit";
import {
  createCrateQrAquaBatch,
  fetchCrateQrAquaDistricts,
} from "../action/crateQrAquaActions";

const initialState = {
  districts: [],
  districtsLoading: false,
  districtsError: null,

  qrs: [],
  createLoading: false,
  createError: null,

  selectedQr: null,
};

const crateQrAquaSlice = createSlice({
  name: "crateQrAqua",
  initialState,
  reducers: {
    clearCrateQrAquaStatus: (state) => {
      state.districtsError = null;
      state.createError = null;
    },

    clearCrateQrAquaBatch: (state) => {
      state.qrs = [];
      state.selectedQr = null;
    },

    setSelectedCrateQrAqua: (state, action) => {
      state.selectedQr = action.payload || null;
    },
  },
  extraReducers: (builder) => {
    builder
      // districts
      .addCase(fetchCrateQrAquaDistricts.pending, (state) => {
        state.districtsLoading = true;
        state.districtsError = null;
      })
      .addCase(fetchCrateQrAquaDistricts.fulfilled, (state, action) => {
        state.districtsLoading = false;
        state.districts = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCrateQrAquaDistricts.rejected, (state, action) => {
        state.districtsLoading = false;
        state.districtsError = action.payload || "Failed to fetch districts";
      })

      // create batch
      .addCase(createCrateQrAquaBatch.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createCrateQrAquaBatch.fulfilled, (state, action) => {
        state.createLoading = false;
        state.qrs = Array.isArray(action.payload) ? action.payload : [];
        state.selectedQr = null;
      })
      .addCase(createCrateQrAquaBatch.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || "Failed to create batch";
      });
  },
});

export const {
  clearCrateQrAquaStatus,
  clearCrateQrAquaBatch,
  setSelectedCrateQrAqua,
} = crateQrAquaSlice.actions;

// IMPORTANT: add this reducer in store as crateQrAqua
export const selectCrateQrAquaDistricts = (s) =>
  s.crateQrAqua?.districts || [];

export const selectCrateQrAquaDistrictsLoading = (s) =>
  !!s.crateQrAqua?.districtsLoading;

export const selectCrateQrAquaDistrictsError = (s) =>
  s.crateQrAqua?.districtsError || null;

export const selectCrateQrAquaQrs = (s) => s.crateQrAqua?.qrs || [];

export const selectCrateQrAquaCreateLoading = (s) =>
  !!s.crateQrAqua?.createLoading;

export const selectCrateQrAquaCreateError = (s) =>
  s.crateQrAqua?.createError || null;

export const selectSelectedCrateQrAqua = (s) =>
  s.crateQrAqua?.selectedQr || null;

export default crateQrAquaSlice.reducer;