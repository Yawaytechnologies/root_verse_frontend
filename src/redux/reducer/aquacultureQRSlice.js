// src/store/reducers/aquacultureQrSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  generateAquacultureQRs,
  fetchQRByCode,
  fetchQRById,
} from "../action/aquacultureQrActions";

const initialState = {
  // Generate QRs
  generatedQRs: null,
  generateLoading: false,
  generateError: null,
  generateSuccess: false,

  // Fetch by code
  qrByCode: null,
  qrByCodeLoading: false,
  qrByCodeError: null,

  // Fetch by ID
  qrById: null,
  qrByIdLoading: false,
  qrByIdError: null,
};

const aquacultureQrSlice = createSlice({
  name: "aquacultureQr",
  initialState,
  reducers: {
    resetGenerateState: (state) => {
      state.generatedQRs = null;
      state.generateLoading = false;
      state.generateError = null;
      state.generateSuccess = false;
    },
    clearQRByCode: (state) => {
      state.qrByCode = null;
      state.qrByCodeError = null;
    },
    clearQRById: (state) => {
      state.qrById = null;
      state.qrByIdError = null;
    },
  },
  extraReducers: (builder) => {
    // ── Generate QRs ──────────────────────────────────────────────
    builder
      .addCase(generateAquacultureQRs.pending, (state) => {
        state.generateLoading = true;
        state.generateError = null;
        state.generateSuccess = false;
      })
      .addCase(generateAquacultureQRs.fulfilled, (state, action) => {
        state.generateLoading = false;
        state.generatedQRs = action.payload;
        state.generateSuccess = true;
      })
      .addCase(generateAquacultureQRs.rejected, (state, action) => {
        state.generateLoading = false;
        state.generateError = action.payload;
        state.generateSuccess = false;
      });

    // ── Fetch by Code ─────────────────────────────────────────────
    builder
      .addCase(fetchQRByCode.pending, (state) => {
        state.qrByCodeLoading = true;
        state.qrByCodeError = null;
      })
      .addCase(fetchQRByCode.fulfilled, (state, action) => {
        state.qrByCodeLoading = false;
        state.qrByCode = action.payload;
      })
      .addCase(fetchQRByCode.rejected, (state, action) => {
        state.qrByCodeLoading = false;
        state.qrByCodeError = action.payload;
      });

    // ── Fetch by ID ───────────────────────────────────────────────
    builder
      .addCase(fetchQRById.pending, (state) => {
        state.qrByIdLoading = true;
        state.qrByIdError = null;
      })
      .addCase(fetchQRById.fulfilled, (state, action) => {
        state.qrByIdLoading = false;
        state.qrById = action.payload;
      })
      .addCase(fetchQRById.rejected, (state, action) => {
        state.qrByIdLoading = false;
        state.qrByIdError = action.payload;
      });
  },
});

export const { resetGenerateState, clearQRByCode, clearQRById } =
  aquacultureQrSlice.actions;

// Selectors
export const selectGeneratedQRs = (state) => state.aquacultureQr.generatedQRs;
export const selectGenerateLoading = (state) =>
  state.aquacultureQr.generateLoading;
export const selectGenerateError = (state) => state.aquacultureQr.generateError;
export const selectGenerateSuccess = (state) =>
  state.aquacultureQr.generateSuccess;

export const selectQRByCode = (state) => state.aquacultureQr.qrByCode;
export const selectQRById = (state) => state.aquacultureQr.qrById;

export default aquacultureQrSlice.reducer;