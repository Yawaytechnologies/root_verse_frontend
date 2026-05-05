// src/store/actions/aquacultureQrActions.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import aquacultureQrService from "../services/aquacultureQRService";

/**
 * Generate aquaculture QR codes in batch
 * Payload: { location_id: number, type: string, year: number, qrs: number }
 */
export const generateAquacultureQRs = createAsyncThunk(
  "aquacultureQr/generate",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await aquacultureQrService.generateQRs(payload);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate QR codes"
      );
    }
  }
);

/**
 * Fetch aquaculture QR by code
 * Payload: string (code)
 */
export const fetchQRByCode = createAsyncThunk(
  "aquacultureQr/fetchByCode",
  async (code, { rejectWithValue }) => {
    try {
      const data = await aquacultureQrService.getQRByCode(code);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch QR by code"
      );
    }
  }
);

/**
 * Fetch aquaculture QR by ID
 * Payload: number (id)
 */
export const fetchQRById = createAsyncThunk(
  "aquacultureQr/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await aquacultureQrService.getQRById(id);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch QR by ID"
      );
    }
  }
);