/**
 * pondApprovalSlice.js
 * Redux slice for pond approval state.
 */

import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAllPonds,
  fetchPondById,
  approvePond,
  rejectPond,
  updatePond,
} from "../action/pondApprovalActions";

const initialState = {
  ponds:         [],
  selectedPond:  null,
  loading:       false,
  detailLoading: false,
  updating:      {},
  updateError:   {},
  error:         null,
};

function normalizeVerificationStatus(v) {
  if (!v) return "pending";
  const lower = v.toLowerCase();
  if (lower === "verified")   return "approved";
  if (lower === "unverified") return "pending";
  if (lower === "rejected")   return "rejected";
  return lower;
}

function normalizePond(raw) {
  return {
    id:                raw.id,
    pond_code:         raw.pond_id                ?? raw.pond_code         ?? null,
    name:              raw.pond_name              ?? raw.name               ?? null,
    farm_id:           raw.farm_id                                          ?? null,
    farm_name:         raw.farm_name                                        ?? null,
    farm_qr_id:        raw.farm_qr_id                                       ?? null,
    user_id:           raw.user_id                                          ?? null,
    species_id:        raw.species_id                                       ?? null,
    area:              raw.water_spread_area_acres ?? raw.area              ?? null,
    water_spread_area: raw.water_spread_area_acres ?? raw.water_spread_area ?? null,
    volume:            raw.volume                                           ?? null,
    pond_type:         raw.pond_type                                        ?? null,
    image_key:         raw.image_key                                        ?? null,
    image_url:         raw.image_url                                        ?? null,
    pond_gps:          raw.pond_gps                                         ?? null,
    is_active:         raw.pond_status ? raw.pond_status === "Active" : (raw.is_active ?? true),
    created_at:        raw.created_at                                       ?? null,
    updated_at:        raw.updated_at                                       ?? null,
    status:            normalizeVerificationStatus(raw.verification_status  ?? raw.status),
  };
}

/* ─── Apply API-field overrides onto an already-normalized pond ─── */
function applyOverridesToPond(pond, overrides = {}) {
  const internal = { ...pond };

  if (overrides.pond_status !== undefined) {
    internal.is_active = overrides.pond_status === "Active";
  }
  if (overrides.verification_status !== undefined) {
    internal.status = normalizeVerificationStatus(overrides.verification_status);
  }
  if (overrides.is_active !== undefined) {
    internal.is_active = overrides.is_active;
  }
  if (overrides.status !== undefined) {
    internal.status = normalizeVerificationStatus(overrides.status);
  }

  return internal;
}

function unwrapPond(payload) {
  if (payload?.data && !Array.isArray(payload.data)) return payload.data;
  return payload;
}

function toNormalizedArray(payload) {
  let arr;
  if (Array.isArray(payload))               arr = payload;
  else if (Array.isArray(payload?.data))    arr = payload.data;
  else if (Array.isArray(payload?.ponds))   arr = payload.ponds;
  else if (Array.isArray(payload?.results)) arr = payload.results;
  else {
    console.warn("[pondSlice] Unexpected API shape:", payload);
    arr = [];
  }
  return arr.map(normalizePond);
}

function replacePondInList(ponds, updated) {
  const idx = ponds.findIndex((p) => p.id === updated.id);
  if (idx === -1) return ponds;
  const next = [...ponds];
  next[idx] = updated;
  return next;
}

const pondSlice = createSlice({
  name: "pondApproval",
  initialState,

  reducers: {
    clearError(state)                            { state.error = null; },
    clearPondUpdateError(state, { payload: id }) { delete state.updateError[id]; },
    clearSelectedPond(state)                     { state.selectedPond = null; },
  },

  extraReducers: (builder) => {

    /* ── fetchAllPonds ── */
    builder
      .addCase(fetchAllPonds.pending,   (s)    => { s.loading = true;  s.error = null; })
      .addCase(fetchAllPonds.fulfilled, (s, a) => { s.loading = false; s.ponds = toNormalizedArray(a.payload); })
      .addCase(fetchAllPonds.rejected,  (s, a) => { s.loading = false; s.error = a.payload ?? "Failed to fetch ponds"; });

    /* ── fetchPondById ── */
    builder
      .addCase(fetchPondById.pending,   (s)    => { s.detailLoading = true; })
      .addCase(fetchPondById.fulfilled, (s, a) => { s.detailLoading = false; s.selectedPond = normalizePond(unwrapPond(a.payload)); })
      .addCase(fetchPondById.rejected,  (s)    => { s.detailLoading = false; });

    /* ── approvePond ── */
    builder
      .addCase(approvePond.pending,   (s, a) => {
        s.updating[a.meta.arg.id] = true;
        delete s.updateError[a.meta.arg.id];
      })
      .addCase(approvePond.fulfilled, (s, a) => {
        const { id, pond } = a.meta.arg;
        // Optimistically move pond to verified+active — no re-fetch to avoid race condition
        const u = applyOverridesToPond(pond, {
          verification_status: "Verified",
          pond_status:         "Active",
        });
        s.updating[id] = false;
        s.ponds = replacePondInList(s.ponds, u);
        if (s.selectedPond?.id === id) s.selectedPond = u;
      })
      .addCase(approvePond.rejected,  (s, a) => {
        const id = a.meta.arg.id;
        s.updating[id] = false;
        s.updateError[id] = a.payload ?? "Approval failed";
      });

    /* ── rejectPond ── */
    builder
      .addCase(rejectPond.pending,   (s, a) => {
        s.updating[a.meta.arg.id] = true;
        delete s.updateError[a.meta.arg.id];
      })
      .addCase(rejectPond.fulfilled, (s, a) => {
        const { id, pond } = a.meta.arg;
        const u = applyOverridesToPond(pond, { verification_status: "Rejected" });
        s.updating[id] = false;
        s.ponds = replacePondInList(s.ponds, u);
        if (s.selectedPond?.id === id) s.selectedPond = u;
      })
      .addCase(rejectPond.rejected,  (s, a) => {
        const id = a.meta.arg.id;
        s.updating[id] = false;
        s.updateError[id] = a.payload ?? "Rejection failed";
      });

    /* ── updatePond ── */
    builder
      .addCase(updatePond.pending,   (s, a) => {
        s.updating[a.meta.arg.id] = true;
        delete s.updateError[a.meta.arg.id];
      })
      .addCase(updatePond.fulfilled, (s, a) => {
        const { id, pond, overrides } = a.meta.arg;
        const u = applyOverridesToPond(pond, overrides);
        s.updating[id] = false;
        s.ponds = replacePondInList(s.ponds, u);
        if (s.selectedPond?.id === id) s.selectedPond = u;
      })
      .addCase(updatePond.rejected,  (s, a) => {
        const id = a.meta.arg.id;
        s.updating[id] = false;
        s.updateError[id] = a.payload ?? "Update failed";
      });
  },
});

export const { clearError, clearPondUpdateError, clearSelectedPond } = pondSlice.actions;

const getPonds = (s) => {
  const p = s.pondApproval.ponds;
  return Array.isArray(p) ? p : [];
};

export const selectAllPonds      = (s) => getPonds(s);
export const selectPendingPonds  = (s) => getPonds(s).filter((p) => p.status === "pending");
export const selectApprovedPonds = (s) => getPonds(s).filter((p) => p.status === "approved");
export const selectRejectedPonds = (s) => getPonds(s).filter((p) => p.status === "rejected");
export const selectPondsLoading  = (s) => s.pondApproval.loading;
export const selectPondsError    = (s) => s.pondApproval.error;
export const selectSelectedPond  = (s) => s.pondApproval.selectedPond;

export default pondSlice.reducer;