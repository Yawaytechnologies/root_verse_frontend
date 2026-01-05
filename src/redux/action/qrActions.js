// src/store/qr/qrActions.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { bulkReserveQrs } from "../services/qrServices";

export const reserveBulkQrs = createAsyncThunk(
  "qr/reserveBulk",
  async ({ type, count }, { rejectWithValue }) => {
    try {
      return await bulkReserveQrs({ type, count });
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to reserve QR batch");
    }
  }
);