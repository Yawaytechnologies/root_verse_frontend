// src/redux/reducer/dashboardSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { fetchWildCaptureDashboard } from "../action/dashboardActions";

const initialState = {
  loading: false,
  error: null,

  ownersTotal: 0,
  vesselsTotal: 0,
  tripsTotal: 0,
  pendingTrips: 0,

  ownersProgress: null, // optional
  trips: [],
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardError(s) {
      s.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchWildCaptureDashboard.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(fetchWildCaptureDashboard.fulfilled, (s, a) => {
      s.loading = false;

      s.ownersTotal = a.payload.ownersTotal || 0;
      s.vesselsTotal = a.payload.vesselsTotal || 0;
      s.tripsTotal = a.payload.tripsTotal || 0;
      s.pendingTrips = a.payload.pendingTrips || 0;

      s.ownersProgress = a.payload.ownersProgress || null;
      s.trips = Array.isArray(a.payload.trips) ? a.payload.trips : [];
    });
    b.addCase(fetchWildCaptureDashboard.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload || "Failed to load dashboard";
    });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
