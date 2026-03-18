/**
 * farmSlice.js
 * Redux slice for farm state management.
 * Handles loading, error, farm list, and per-item updating states.
 */

import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAllFarms,
  fetchFarmById,
  approveFarm,
  rejectFarm,
  updateFarm,
} from "../action/farmActions";

/* ─── Initial state ─── */
const initialState = {
  /** Full list of farms from API */
  farms: [],

  /** Currently selected / detail farm */
  selectedFarm: null,

  /** Global list loading state */
  loading: false,

  /** Detail fetch loading state */
  detailLoading: false,

  /** Per-farm update loading map: { [farmId]: boolean } */
  updating: {},

  /** Per-farm update error map: { [farmId]: string | null } */
  updateError: {},

  /** Global list fetch error */
  error: null,
};

/* ─── Helpers ─── */
function replaceFarmInList(farms, updated) {
  const idx = farms.findIndex((f) => f.id === updated.id);
  if (idx === -1) return farms;
  const next = [...farms];
  next[idx] = updated;
  return next;
}

/* ─── Slice ─── */
const farmSlice = createSlice({
  name: "farms",
  initialState,

  reducers: {
    /** Clear the global error */
    clearError(state) {
      state.error = null;
    },

    /** Clear error for a specific farm */
    clearFarmUpdateError(state, action) {
      delete state.updateError[action.payload];
    },

    /** Clear selected farm detail */
    clearSelectedFarm(state) {
      state.selectedFarm = null;
    },

    /**
     * Optimistically update a farm in the list (useful for instant UI feedback
     * before the API response arrives).
     */
    optimisticUpdateFarm(state, action) {
      state.farms = replaceFarmInList(state.farms, action.payload);
    },
  },

  extraReducers: (builder) => {
    /* ── fetchAllFarms ── */
    builder
      .addCase(fetchAllFarms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllFarms.fulfilled, (state, action) => {
        state.loading = false;
        state.farms = action.payload;
      })
      .addCase(fetchAllFarms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch farms";
      });

    /* ── fetchFarmById ── */
    builder
      .addCase(fetchFarmById.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchFarmById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedFarm = action.payload;
      })
      .addCase(fetchFarmById.rejected, (state) => {
        state.detailLoading = false;
      });

    /* ── approveFarm ── */
    builder
      .addCase(approveFarm.pending, (state, action) => {
        state.updating[action.meta.arg.id] = true;
        delete state.updateError[action.meta.arg.id];
      })
      .addCase(approveFarm.fulfilled, (state, action) => {
        const updated = action.payload;
        state.updating[updated.id] = false;
        state.farms = replaceFarmInList(state.farms, updated);
        if (state.selectedFarm?.id === updated.id) {
          state.selectedFarm = updated;
        }
      })
      .addCase(approveFarm.rejected, (state, action) => {
        const id = action.meta.arg.id;
        state.updating[id] = false;
        state.updateError[id] = action.payload ?? "Approval failed";
      });

    /* ── rejectFarm ── */
    builder
      .addCase(rejectFarm.pending, (state, action) => {
        state.updating[action.meta.arg.id] = true;
        delete state.updateError[action.meta.arg.id];
      })
      .addCase(rejectFarm.fulfilled, (state, action) => {
        const updated = action.payload;
        state.updating[updated.id] = false;
        state.farms = replaceFarmInList(state.farms, updated);
        if (state.selectedFarm?.id === updated.id) {
          state.selectedFarm = updated;
        }
      })
      .addCase(rejectFarm.rejected, (state, action) => {
        const id = action.meta.arg.id;
        state.updating[id] = false;
        state.updateError[id] = action.payload ?? "Rejection failed";
      });

    /* ── updateFarm (generic) ── */
    builder
      .addCase(updateFarm.pending, (state, action) => {
        state.updating[action.meta.arg.id] = true;
      })
      .addCase(updateFarm.fulfilled, (state, action) => {
        const updated = action.payload;
        state.updating[updated.id] = false;
        state.farms = replaceFarmInList(state.farms, updated);
        if (state.selectedFarm?.id === updated.id) {
          state.selectedFarm = updated;
        }
      })
      .addCase(updateFarm.rejected, (state, action) => {
        const id = action.meta.arg.id;
        state.updating[id] = false;
        state.updateError[id] = action.payload ?? "Update failed";
      });
  },
});

/* ─── Actions ─── */
export const {
  clearError,
  clearFarmUpdateError,
  clearSelectedFarm,
  optimisticUpdateFarm,
} = farmSlice.actions;

/* ─── Selectors ─── */
export const selectAllFarms = (state) => state.farmApproval.farms;
export const selectPendingFarms = (state) =>
  state.farmApproval.farms.filter((f) => f.status === "pending");
export const selectApprovedFarms = (state) =>
  state.farmApproval.farms.filter((f) => f.status === "approved");
export const selectRejectedFarms = (state) =>
  state.farmApproval.farms.filter((f) => f.status === "rejected");
export const selectFarmsLoading = (state) => state.farmApproval.loading;
export const selectFarmsError = (state) => state.farmApproval.error;
export const selectSelectedFarm = (state) => state.farmApproval.selectedFarm;
export const selectFarmUpdating = (id) => (state) =>
  !!state.farmApproval.updating[id];
export const selectFarmUpdateError = (id) => (state) =>
  state.farmApproval.updateError[id] ?? null;

/* ─── Reducer ─── */
export default farmSlice.reducer;