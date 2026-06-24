import { createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../services/crateQrAquaServices";

export const fetchCrateQrAquaDistricts = createAsyncThunk(
  "crateQrAqua/fetchDistricts",
  async (_, { rejectWithValue }) => {
    try {
      return await api.fetchDistricts();
    } catch (e) {
      return rejectWithValue(e?.message || "Failed to fetch districts");
    }
  }
);

export const createCrateQrAquaBatch = createAsyncThunk(
  "crateQrAqua/createBatch",
  async ({ count, districtId }, { rejectWithValue }) => {
    try {
      return await api.createBatch({
        count,
        districtId,
      });
    } catch (e) {
      return rejectWithValue(e?.message || "Failed to create batch");
    }
  }
);