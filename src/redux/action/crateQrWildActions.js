import { createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../services/crateQrWildServices";

export const fetchCrateQrWildDistricts = createAsyncThunk(
  "crateQrWild/fetchDistricts",
  async (_, { rejectWithValue }) => {
    try {
      return await api.fetchDistricts();
    } catch (e) {
      return rejectWithValue(e?.message || "Failed to fetch districts");
    }
  }
);

export const createCrateQrWildBatch = createAsyncThunk(
  "crateQrWild/createBatch",
  async ({ type, count, districtId }, { rejectWithValue }) => {
    try {
      return await api.createBatch({ type, count, districtId });
    } catch (e) {
      return rejectWithValue(e?.message || "Failed to create batch");
    }
  }
);