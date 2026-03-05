import { createSlice } from "@reduxjs/toolkit";
import { getAllQcInspections } from "../../redux/action/qcInspectionActions";

const initialState = {
  items: [],
  total: 0,
  pagesFetched: 0,
  loading: false,
  error: null,
  lastFetchedAt: null,
};

const qcInspectionSlice = createSlice({
  name: "qcInspection",
  initialState,
  reducers: {
    clearQcInspectionState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllQcInspections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllQcInspections.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
        state.pagesFetched = action.payload.pagesFetched || 0;
        state.lastFetchedAt = new Date().toISOString();
      })
      .addCase(getAllQcInspections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { clearQcInspectionState } = qcInspectionSlice.actions;
export default qcInspectionSlice.reducer;