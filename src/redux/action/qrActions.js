// src/store/qr/qrActions.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { bulkReserveQrs } from "../services/qrServices";

export const reserveBulkQrs = createAsyncThunk(
  "qr/reserveBulk",
  async ({ type, count, locationId, methodId }, { rejectWithValue }) => {
    try {
      return await bulkReserveQrs({
        type,
        count,
        locationId,
        methodId,
      });
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to reserve QR batch");
    }
  }
);
