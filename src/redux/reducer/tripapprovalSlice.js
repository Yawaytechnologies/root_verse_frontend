// src/redux/reducer/tripSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { getTrips, approveTrip } from "../action/tripapprovalActions";

const initialState = {
  loading: false,
  error: null,
  list: [],

  approvingById: {},
  approveErrorById: {},
};

const tripSlice = createSlice({
  name: "trip",
  initialState,
  reducers: {
    clearTripError(state) {
      state.error = null;
    },
    clearApproveError(state, action) {
      const id = action.payload;
      if (id) state.approveErrorById[id] = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET trips
      .addCase(getTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload || [];
      })
      .addCase(getTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch trips";
      })

      // APPROVE trip
      .addCase(approveTrip.pending, (state, action) => {
        const id = action.meta.arg?.id;
        if (id != null) state.approvingById[id] = true;
        if (id != null) state.approveErrorById[id] = null;
      })
      .addCase(approveTrip.fulfilled, (state, action) => {
        const id = action.payload?.id;
        if (id != null) state.approvingById[id] = false;

        // Update list locally (API may or may not return updated trip)
        const idx = state.list.findIndex((t) => t.id === id);
        if (idx !== -1) {
          state.list[idx] = {
            ...state.list[idx],
            approval_status: "approved",
            updated_at: new Date().toISOString(),
          };
        }
      })
      .addCase(approveTrip.rejected, (state, action) => {
        const id = action.meta.arg?.id;
        if (id != null) state.approvingById[id] = false;
        if (id != null) state.approveErrorById[id] = action.payload || "Approve failed";
      });
  },
});

export const { clearTripError, clearApproveError } = tripSlice.actions;
export default tripSlice.reducer;
