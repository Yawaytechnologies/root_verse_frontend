import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  fetchProcessorsApi,
  fetchProcessorByIdApi,
  updateProcessorStatusApi,
} from "../services/adminProcessor.service";

export const fetchAdminProcessors = createAsyncThunk(
  "adminProcessor/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchProcessorsApi();
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch processors");
    }
  }
);

export const fetchAdminProcessorById = createAsyncThunk(
  "adminProcessor/fetchById",
  async (processorId, { rejectWithValue }) => {
    try {
      return await fetchProcessorByIdApi(processorId);
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch processor details"
      );
    }
  }
);

export const updateAdminProcessorStatus = createAsyncThunk(
  "adminProcessor/updateStatus",
  async ({ processorId, status }, { rejectWithValue }) => {
    try {
      const processor = await updateProcessorStatusApi(processorId, status);

      return {
        processorId,
        status,
        processor,
      };
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to update processor status"
      );
    }
  }
);
