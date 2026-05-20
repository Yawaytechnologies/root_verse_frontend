import { createSlice } from "@reduxjs/toolkit";
import { fetchSamplingRecords } from "../action/samplingActions";

const normalizeRecords = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.records)) return payload.records;
  return [];
};

const initialState = {
  records: [],
  loading: false,
  error: null,
  success: false,
  message: "",
};

const samplingSlice = createSlice({
  name: "sampling",
  initialState,
  reducers: {
    clearSamplingError: (state) => {
      state.error = null;
    },
    resetSamplingState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSamplingRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(fetchSamplingRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.success = Boolean(action.payload?.success ?? true);
        state.records = normalizeRecords(action.payload);
        state.message =
          action.payload?.message || "Sampling records fetched successfully";
      })
      .addCase(fetchSamplingRecords.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.records = [];
        state.error = action.payload || "Failed to fetch sampling records";
      });
  },
});

export const { clearSamplingError, resetSamplingState } = samplingSlice.actions;

export default samplingSlice.reducer;