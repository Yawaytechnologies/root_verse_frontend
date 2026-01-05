// src/store/qr/qrSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { reserveBulkQrs } from "../action/qrActions";

const initialState = {
  loading: false,
  error: null,

  type: "VESSEL",
  count: "", // admin enters each time

  lastBatch: [],
  lastBatchMeta: null,
  selectedCode: "",
};

const qrSlice = createSlice({
  name: "qr",
  initialState,
  reducers: {
    setType(state, action) {
      state.type = action.payload;
    },
    setCount(state, action) {
      state.count = action.payload; // keep string
    },
    setSelectedCode(state, action) {
      state.selectedCode = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(reserveBulkQrs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reserveBulkQrs.fulfilled, (state, action) => {
        state.loading = false;

        state.lastBatchMeta = {
          success: action.payload.success,
          count: action.payload.count,
        };

        state.lastBatch = action.payload.qrs || [];
        state.selectedCode =
          state.lastBatch?.[state.lastBatch.length - 1]?.code || "";

        state.count = ""; // reset after generation
      })
      .addCase(reserveBulkQrs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Request failed";
      });
  },
});

export const { setType, setCount, setSelectedCode, clearError } =
  qrSlice.actions;

export default qrSlice.reducer;
