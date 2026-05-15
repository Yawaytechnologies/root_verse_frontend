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
  ponds: [],
  selectedPond: null,
  loading: false,
  detailLoading: false,
  updating: {},
  updateError: {},
  error: null,
};

function normalizeVerificationStatus(value) {
  if (!value) return "pending";

  const status = String(value).trim().toLowerCase();

  if (status === "verified") return "approved";
  if (status === "approved") return "approved";

  if (status === "unverified") return "pending";
  if (status === "pending") return "pending";

  if (status === "rejected") return "rejected";

  return status;
}

function normalizeActiveStatus(value, fallback = true) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return String(value).trim().toLowerCase() === "active";
}

function normalizePond(raw = {}) {
  const verificationStatus = raw.verification_status ?? raw.status ?? null;
  const activeStatus = raw.pond_status ?? raw.active_status ?? null;

  const pondQr =
    raw.qrs_id ??
    raw.qrs_code ??
    raw.pond_qr_id ??
    raw.pond_qr ??
    raw.qr_code ??
    raw.qr_id ??
    null;

  const pondCode = raw.pond_id ?? raw.pond_code ?? null;
  const pondName = raw.pond_name ?? raw.name ?? null;

  const area =
    raw.water_spread_area_acres ??
    raw.water_spread_area ??
    raw.area ??
    null;

  return {
    // Internal DB id. Use only for update/delete/key. Do not show in UI.
    id: raw.id ?? null,

    // Pond identity
    pond_code: pondCode,
    pond_id: pondCode,

    name: pondName,
    pond_name: pondName,

    // Pond QR
    qrs_id: pondQr,
    qrs_code: pondQr,
    pond_qr_id: pondQr,
    pond_qr: pondQr,
    qr_code: pondQr,

    // Farm / owner
    farm_id: raw.farm_id ?? null,
    farm_code: raw.farm_code ?? null,
    farm_name: raw.farm_name ?? null,
    farm_qr_id: raw.farm_qr_id ?? raw.farm_qrs ?? null,

    user_id: raw.user_id ?? null,
    owner_id: raw.owner_id ?? null,
    username: raw.username ?? null,

    // Optional legacy/internal fields
    species_id: raw.species_id ?? null,

    // Measurements
    area,
    water_spread_area: area,
    water_spread_area_acres: area,
    volume: raw.volume ?? null,

    // Pond details
    pond_type: raw.pond_type ?? null,
    pond_gps: raw.pond_gps ?? null,

    // Images
    image_key: raw.image_key ?? null,
    image_url: raw.image_url ?? null,

    // Status
    pond_status: activeStatus,
    verification_status: verificationStatus,
    is_active: normalizeActiveStatus(activeStatus, raw.is_active ?? true),
    status: normalizeVerificationStatus(verificationStatus),

    // Timestamps
    created_at: raw.created_at ?? null,
    updated_at: raw.updated_at ?? null,
  };
}

function applyOverridesToPond(pond, overrides = {}) {
  const next = { ...pond };

  if (overrides.pond_status !== undefined) {
    next.pond_status = overrides.pond_status;
    next.is_active = normalizeActiveStatus(overrides.pond_status, next.is_active);
  }

  if (overrides.active_status !== undefined) {
    next.pond_status = overrides.active_status;
    next.is_active = normalizeActiveStatus(
      overrides.active_status,
      next.is_active
    );
  }

  if (overrides.is_active !== undefined) {
    next.is_active = overrides.is_active;
    next.pond_status = overrides.is_active ? "Active" : "Inactive";
  }

  if (overrides.verification_status !== undefined) {
    next.verification_status = overrides.verification_status;
    next.status = normalizeVerificationStatus(overrides.verification_status);
  }

  if (overrides.status !== undefined) {
    next.verification_status = overrides.status;
    next.status = normalizeVerificationStatus(overrides.status);
  }

  return next;
}

function unwrapPond(payload) {
  if (payload?.data && !Array.isArray(payload.data)) return payload.data;
  if (payload?.pond && !Array.isArray(payload.pond)) return payload.pond;
  if (payload?.result && !Array.isArray(payload.result)) return payload.result;

  return payload;
}

function toNormalizedArray(payload) {
  let arr = [];

  if (Array.isArray(payload)) {
    arr = payload;
  } else if (Array.isArray(payload?.data)) {
    arr = payload.data;
  } else if (Array.isArray(payload?.ponds)) {
    arr = payload.ponds;
  } else if (Array.isArray(payload?.results)) {
    arr = payload.results;
  } else if (Array.isArray(payload?.result)) {
    arr = payload.result;
  } else {
    console.warn("[pondApprovalSlice] Unexpected API shape:", payload);
  }

  return arr.map(normalizePond);
}

function replacePondInList(ponds, updated) {
  const index = ponds.findIndex((pond) => pond.id === updated.id);

  if (index === -1) return ponds;

  const next = [...ponds];
  next[index] = updated;

  return next;
}

const pondSlice = createSlice({
  name: "pondApproval",
  initialState,

  reducers: {
    clearError(state) {
      state.error = null;
    },

    clearPondUpdateError(state, { payload: id }) {
      delete state.updateError[id];
    },

    clearSelectedPond(state) {
      state.selectedPond = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPonds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPonds.fulfilled, (state, action) => {
        state.loading = false;
        state.ponds = toNormalizedArray(action.payload);
      })
      .addCase(fetchAllPonds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch ponds";
      });

    builder
      .addCase(fetchPondById.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchPondById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedPond = normalizePond(unwrapPond(action.payload));
      })
      .addCase(fetchPondById.rejected, (state) => {
        state.detailLoading = false;
      });

    builder
      .addCase(approvePond.pending, (state, action) => {
        const id = action.meta.arg.id;

        state.updating[id] = true;
        delete state.updateError[id];
      })
      .addCase(approvePond.fulfilled, (state, action) => {
        const { id, pond } = action.meta.arg;

        const updated = applyOverridesToPond(pond, {
          verification_status: "Verified",
          pond_status: "Active",
        });

        state.updating[id] = false;
        state.ponds = replacePondInList(state.ponds, updated);

        if (state.selectedPond?.id === id) {
          state.selectedPond = updated;
        }
      })
      .addCase(approvePond.rejected, (state, action) => {
        const id = action.meta.arg.id;

        state.updating[id] = false;
        state.updateError[id] = action.payload ?? "Approval failed";
      });

    builder
      .addCase(rejectPond.pending, (state, action) => {
        const id = action.meta.arg.id;

        state.updating[id] = true;
        delete state.updateError[id];
      })
      .addCase(rejectPond.fulfilled, (state, action) => {
        const { id, pond } = action.meta.arg;

        const updated = applyOverridesToPond(pond, {
          verification_status: "Rejected",
        });

        state.updating[id] = false;
        state.ponds = replacePondInList(state.ponds, updated);

        if (state.selectedPond?.id === id) {
          state.selectedPond = updated;
        }
      })
      .addCase(rejectPond.rejected, (state, action) => {
        const id = action.meta.arg.id;

        state.updating[id] = false;
        state.updateError[id] = action.payload ?? "Rejection failed";
      });

    builder
      .addCase(updatePond.pending, (state, action) => {
        const id = action.meta.arg.id;

        state.updating[id] = true;
        delete state.updateError[id];
      })
      .addCase(updatePond.fulfilled, (state, action) => {
        const { id, pond, overrides } = action.meta.arg;

        const updated = applyOverridesToPond(pond, overrides);

        state.updating[id] = false;
        state.ponds = replacePondInList(state.ponds, updated);

        if (state.selectedPond?.id === id) {
          state.selectedPond = updated;
        }
      })
      .addCase(updatePond.rejected, (state, action) => {
        const id = action.meta.arg.id;

        state.updating[id] = false;
        state.updateError[id] = action.payload ?? "Update failed";
      });
  },
});

export const {
  clearError,
  clearPondUpdateError,
  clearSelectedPond,
} = pondSlice.actions;

const getPonds = (state) => {
  const ponds = state.pondApproval.ponds;
  return Array.isArray(ponds) ? ponds : [];
};

export const selectAllPonds = (state) => getPonds(state);

export const selectPendingPonds = (state) =>
  getPonds(state).filter((pond) => pond.status === "pending");

export const selectApprovedPonds = (state) =>
  getPonds(state).filter((pond) => pond.status === "approved");

export const selectRejectedPonds = (state) =>
  getPonds(state).filter((pond) => pond.status === "rejected");

export const selectPondsLoading = (state) => state.pondApproval.loading;

export const selectPondsError = (state) => state.pondApproval.error;

export const selectSelectedPond = (state) => state.pondApproval.selectedPond;

export default pondSlice.reducer;