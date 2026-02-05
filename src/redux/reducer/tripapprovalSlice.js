// src/redux/reducer/tripapprovalSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchTripsByStatus,
  approveTrip,
  fetchTripDetails,
  fetchCatchlogsForTrip,
} from "../action/tripapprovalActions";

const initialState = {
  // ✅ two lists
  pending: [],
  approved: [],

  // loading + error
  loadingPending: false,
  loadingApproved: false,
  errorPending: null,
  errorApproved: null,

  // approve
  approvingById: {},
  approveErrorById: {},

  // details by id
  tripDetailsById: {},
  tripDetailsLoadingById: {},
  tripDetailsErrorById: {},

  // catchlogs by tripId
  catchlogsByTripId: {},
  catchlogsLoadingByTripId: {},
  catchlogsErrorByTripId: {},
  catchlogsQcFilterByTripId: {},
};

function normStatus(v) {
  return String(v || "pending").toLowerCase();
}

function upsert(list, item, key = "id") {
  const id = item?.[key];
  if (id == null) return list;
  const idx = list.findIndex((x) => x?.[key] === id);
  if (idx === -1) return [item, ...list];
  const copy = list.slice();
  copy[idx] = { ...copy[idx], ...item };
  return copy;
}

function removeById(list, id) {
  return (list || []).filter((x) => x?.id !== id);
}

const tripApprovalSlice = createSlice({
  name: "trip",
  initialState,
  reducers: {
    clearApproveError(state, action) {
      const id = action.payload;
      if (id != null) state.approveErrorById[id] = null;
    },
    clearTripsError(state) {
      state.errorPending = null;
      state.errorApproved = null;
    },
    clearTripDetailsError(state, action) {
      const id = action.payload;
      if (id != null) state.tripDetailsErrorById[id] = null;
    },
    clearCatchlogsError(state, action) {
      const tripId = action.payload;
      if (tripId != null) state.catchlogsErrorByTripId[tripId] = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ FETCH TRIPS BY STATUS
      .addCase(fetchTripsByStatus.pending, (state, action) => {
        const s = normStatus(action.meta.arg?.status);
        if (s === "approved") {
          state.loadingApproved = true;
          state.errorApproved = null;
        } else {
          state.loadingPending = true;
          state.errorPending = null;
        }
      })
      .addCase(fetchTripsByStatus.fulfilled, (state, action) => {
        const s = normStatus(action.payload?.status);
        const trips = action.payload?.trips || [];

        if (s === "approved") {
          state.loadingApproved = false;
          state.approved = Array.isArray(trips) ? trips : [];
        } else {
          state.loadingPending = false;
          state.pending = Array.isArray(trips) ? trips : [];
        }
      })
      .addCase(fetchTripsByStatus.rejected, (state, action) => {
        const s = normStatus(action.meta.arg?.status);
        const msg = action.payload || "Failed to fetch trips";

        if (s === "approved") {
          state.loadingApproved = false;
          state.errorApproved = msg;
          state.approved = [];
        } else {
          state.loadingPending = false;
          state.errorPending = msg;
          state.pending = [];
        }
      })

      // ✅ APPROVE
      .addCase(approveTrip.pending, (state, action) => {
        const id = action.meta.arg?.id;
        if (id != null) {
          state.approvingById[id] = true;
          state.approveErrorById[id] = null;
        }
      })
      .addCase(approveTrip.fulfilled, (state, action) => {
        const id = action.payload?.id;
        if (id != null) state.approvingById[id] = false;

        // move from pending -> approved
        const found = state.pending.find((t) => t?.id === id);
        if (found) {
          const approvedTrip = {
            ...found,
            approval_status: "approved",
            updated_at: new Date().toISOString(),
          };

          state.pending = removeById(state.pending, id);
          state.approved = upsert(state.approved, approvedTrip);
        } else {
          // if already in approved list, just update
          const already = state.approved.find((t) => t?.id === id);
          if (already) {
            state.approved = upsert(state.approved, {
              ...already,
              approval_status: "approved",
              updated_at: new Date().toISOString(),
            });
          }
        }
      })
      .addCase(approveTrip.rejected, (state, action) => {
        const id = action.meta.arg?.id;
        if (id != null) state.approvingById[id] = false;
        if (id != null) state.approveErrorById[id] = action.payload || "Approve failed";
      })

      // ✅ TRIP DETAILS
      .addCase(fetchTripDetails.pending, (state, action) => {
        const id = action.meta.arg?.id;
        if (id != null) {
          state.tripDetailsLoadingById[id] = true;
          state.tripDetailsErrorById[id] = null;
        }
      })
      .addCase(fetchTripDetails.fulfilled, (state, action) => {
        const id = action.payload?.id;
        if (id != null) state.tripDetailsLoadingById[id] = false;
        if (id != null) state.tripDetailsById[id] = action.payload?.trip || null;
      })
      .addCase(fetchTripDetails.rejected, (state, action) => {
        const id = action.meta.arg?.id;
        if (id != null) state.tripDetailsLoadingById[id] = false;
        if (id != null) state.tripDetailsErrorById[id] = action.payload || "Failed to fetch trip details";
      })

      // ✅ CATCHLOGS
      .addCase(fetchCatchlogsForTrip.pending, (state, action) => {
        const tripId = action.meta.arg?.tripId;
        const qc = String(action.meta.arg?.qcStatus || "all").toLowerCase();
        if (tripId != null) {
          state.catchlogsLoadingByTripId[tripId] = true;
          state.catchlogsErrorByTripId[tripId] = null;
          state.catchlogsQcFilterByTripId[tripId] = qc;
        }
      })
      .addCase(fetchCatchlogsForTrip.fulfilled, (state, action) => {
        const tripId = action.payload?.tripId;
        if (tripId != null) state.catchlogsLoadingByTripId[tripId] = false;
        if (tripId != null) state.catchlogsByTripId[tripId] = action.payload?.rows || [];
      })
      .addCase(fetchCatchlogsForTrip.rejected, (state, action) => {
        const tripId = action.meta.arg?.tripId;
        if (tripId != null) state.catchlogsLoadingByTripId[tripId] = false;
        if (tripId != null) state.catchlogsErrorByTripId[tripId] = action.payload || "Failed to fetch catch logs";
      });
  },
});

export const {
  clearApproveError,
  clearTripsError,
  clearTripDetailsError,
  clearCatchlogsError,
} = tripApprovalSlice.actions;

export default tripApprovalSlice.reducer;

// ✅ IMPORTANT: allow importing these from the slice file (your component does that)
export { fetchTripsByStatus, fetchTripDetails, fetchCatchlogsForTrip };
