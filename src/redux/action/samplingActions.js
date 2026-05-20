import { createAsyncThunk } from "@reduxjs/toolkit";
import { samplingService } from "../services/samplingServices";

export const fetchSamplingRecords = createAsyncThunk(
  "sampling/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await samplingService.getAllSampling();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);