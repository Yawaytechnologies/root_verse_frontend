/**
 * farmapprovalSlice.js
 * Normalizes API field names to internal names used by the UI.
 *
 * API shape              → Internal name
 * ───────────────────────────────────────
 * farm_id               → farm_code
 * farm_name             → name
 * address               → farm_address
 * farm_gate_latitude    → latitude
 * farm_gate_longitude   → longitude
 * farm_area_acres       → total_area
 * user_id               → owner_id
 * status (missing)      → defaults to "pending"
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
  farms: [],
  selectedFarm: null,
  loading: false,
  detailLoading: false,
  updating: {},
  updateError: {},
  error: null,
};

/* ─── Field normalizer ─────────────────────────────────────────
   Maps every raw API farm object to the shape the UI expects.
   Safe to call on already-normalized objects (idempotent).
──────────────────────────────────────────────────────────────── */
function normalizeFarm(raw) {
  return {
    id:            raw.id,
    farm_code:     raw.farm_id               ?? raw.farm_code    ?? null,
    name:          raw.farm_name             ?? raw.name         ?? null,
    farm_address:  raw.address               ?? raw.farm_address ?? null,
    latitude:      raw.farm_gate_latitude    ?? raw.latitude     ?? null,
    longitude:     raw.farm_gate_longitude   ?? raw.longitude    ?? null,
    total_area:    raw.farm_area_acres       ?? raw.total_area   ?? null,
    water_source:  raw.water_source          ?? null,
    owner_id:      raw.user_id               ?? raw.owner_id     ?? null,
    owner_name:    raw.owner_name            ?? null,
    pond_count:    raw.pond_count            ?? null,
    district_code: raw.district_code         ?? null,
    state_code:    raw.state_code            ?? null,
    country_code:  raw.country_code          ?? null,
    location_code: raw.location_code         ?? null,
    image_url:     raw.image_url             ?? null,
    created_at:    raw.created_at            ?? null,
    updated_at:    raw.updated_at            ?? null,
    // API doesn't return status yet — default all to "pending"
    status:        raw.status               ?? "pending",
  };
}

/* ─── Helpers ─── */
function toNormalizedArray(payload) {
  let arr;
  if (Array.isArray(payload))               arr = payload;
  else if (Array.isArray(payload?.data))    arr = payload.data;
  else if (Array.isArray(payload?.farms))   arr = payload.farms;
  else if (Array.isArray(payload?.results)) arr = payload.results;
  else {
    console.warn("[farmSlice] Unexpected API shape:", payload);
    arr = [];
  }
  return arr.map(normalizeFarm);
}

function replaceFarmInList(farms, updated) {
  const idx = farms.findIndex((f) => f.id === updated.id);
  if (idx === -1) return farms;
  const next = [...farms];
  next[idx] = normalizeFarm(updated);
  return next;
}

/* ─── Slice ─── */
const farmSlice = createSlice({
  name: "farmApproval",
  initialState,

  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearFarmUpdateError(state, action) {
      delete state.updateError[action.payload];
    },
    clearSelectedFarm(state) {
      state.selectedFarm = null;
    },
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
        state.farms = toNormalizedArray(action.payload);
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
        state.selectedFarm = normalizeFarm(action.payload);
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
        const updated = normalizeFarm(action.payload);
        state.updating[updated.id] = false;
        state.farms = replaceFarmInList(state.farms, updated);
        if (state.selectedFarm?.id === updated.id) state.selectedFarm = updated;
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
        const updated = normalizeFarm(action.payload);
        state.updating[updated.id] = false;
        state.farms = replaceFarmInList(state.farms, updated);
        if (state.selectedFarm?.id === updated.id) state.selectedFarm = updated;
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
        const updated = normalizeFarm(action.payload);
        state.updating[updated.id] = false;
        state.farms = replaceFarmInList(state.farms, updated);
        if (state.selectedFarm?.id === updated.id) state.selectedFarm = updated;
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

/* ─── Safe base selector ─── */
const getFarms = (state) => {
  const f = state.farmApproval.farms;
  return Array.isArray(f) ? f : [];
};

/* ─── Selectors ─── */
export const selectAllFarms        = (state) => getFarms(state);
export const selectPendingFarms    = (state) => getFarms(state).filter((f) => f.status === "pending");
export const selectApprovedFarms   = (state) => getFarms(state).filter((f) => f.status === "approved");
export const selectRejectedFarms   = (state) => getFarms(state).filter((f) => f.status === "rejected");
export const selectFarmsLoading    = (state) => state.farmApproval.loading;
export const selectFarmsError      = (state) => state.farmApproval.error;
export const selectSelectedFarm    = (state) => state.farmApproval.selectedFarm;
export const selectFarmUpdating    = (id) => (state) => !!state.farmApproval.updating[id];
export const selectFarmUpdateError = (id) => (state) => state.farmApproval.updateError[id] ?? null;

/* ─── Reducer ─── */
export default farmSlice.reducer;