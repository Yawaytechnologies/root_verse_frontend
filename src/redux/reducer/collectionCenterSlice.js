import { createSlice } from "@reduxjs/toolkit";
import {
  fetchStates,
  fetchDistricts,
  createCollectionCenter,
  fetchCollectionCenters,
  fetchCenterDetail,
  updateCollectionCenter,
} from "../action/collectionCenterActions";

/** Normalise API list to [{ value, label }] regardless of shape */
function normalise(raw) {
  return (raw ?? []).map((item) =>
    typeof item === "string"
      ? { value: item, label: item }
      : { value: item.name ?? item.id ?? item.value, label: item.name ?? item.label ?? item.id }
  );
}

const initialState = {
  // ── Dropdown data (create form) ───────────────────────────
  states:        [],
  districts:     [],
  statesLoading: false,
  distLoading:   false,
  statesError:   null,
  distError:     null,

  // ── Create ────────────────────────────────────────────────
  submitLoading: false,
  submitSuccess: false,
  submitError:   null,
  createdCenter: null,

  // ── List ──────────────────────────────────────────────────
  list:          [],
  listLoading:   false,
  listError:     null,
  currentPage:   1,
  pageSize:      20,
  totalCount:    null,   // if API returns total

  // ── Detail ────────────────────────────────────────────────
  detail:        null,
  detailLoading: false,
  detailError:   null,

  // ── Update ────────────────────────────────────────────────
  updateLoading: false,
  updateError:   null,
  updateSuccess: false,
};

const collectionCenterSlice = createSlice({
  name: "collectionCenter",
  initialState,

  reducers: {
    resetSubmit(state) {
      state.submitLoading = false;
      state.submitSuccess = false;
      state.submitError   = null;
      state.createdCenter = null;
    },
    clearDistricts(state) {
      state.districts = [];
      state.distError  = null;
    },
    resetUpdate(state) {
      state.updateLoading = false;
      state.updateError   = null;
      state.updateSuccess = false;
    },
    clearDetail(state) {
      state.detail      = null;
      state.detailError = null;
    },
    setPage(state, action) {
      state.currentPage = action.payload;
    },
  },

  extraReducers: (builder) => {
    // ── Fetch States ──────────────────────────────────────────
    builder
      .addCase(fetchStates.pending, (state) => {
        state.statesLoading = true; state.statesError = null;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.statesLoading = false;
        const raw = action.payload?.data ?? action.payload;
        state.states = normalise(Array.isArray(raw) ? raw : []);
      })
      .addCase(fetchStates.rejected, (state, action) => {
        state.statesLoading = false;
        state.statesError   = action.payload || "Could not load states.";
      });

    // ── Fetch Districts ───────────────────────────────────────
    builder
      .addCase(fetchDistricts.pending, (state) => {
        state.distLoading = true; state.distError = null; state.districts = [];
      })
      .addCase(fetchDistricts.fulfilled, (state, action) => {
        state.distLoading = false;
        const raw = action.payload?.data ?? action.payload;
        state.districts = normalise(Array.isArray(raw) ? raw : []);
      })
      .addCase(fetchDistricts.rejected, (state, action) => {
        state.distLoading = false;
        state.distError   = action.payload || "Could not load districts.";
        state.districts   = [];
      });

    // ── Create ────────────────────────────────────────────────
    builder
      .addCase(createCollectionCenter.pending, (state) => {
        state.submitLoading = true; state.submitSuccess = false; state.submitError = null;
      })
      .addCase(createCollectionCenter.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.submitSuccess = true;
        state.createdCenter = action.payload?.data ?? action.payload;
      })
      .addCase(createCollectionCenter.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError   = action.payload ?? { message: "Something went wrong." };
      });

    // ── Fetch List ────────────────────────────────────────────
    builder
      .addCase(fetchCollectionCenters.pending, (state) => {
        state.listLoading = true; state.listError = null;
      })
      .addCase(fetchCollectionCenters.fulfilled, (state, action) => {
        state.listLoading = false;
        const payload     = action.payload;
        state.list        = Array.isArray(payload?.data) ? payload.data : [];
        state.totalCount  = payload?.total ?? payload?.meta?.total ?? null;
      })
      .addCase(fetchCollectionCenters.rejected, (state, action) => {
        state.listLoading = false;
        state.listError   = action.payload || "Failed to load centres.";
      });

    // ── Fetch Detail ──────────────────────────────────────────
    builder
      .addCase(fetchCenterDetail.pending, (state) => {
        state.detailLoading = true; state.detailError = null;
      })
      .addCase(fetchCenterDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detail        = action.payload?.data ?? action.payload;
      })
      .addCase(fetchCenterDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError   = action.payload || "Failed to load centre detail.";
      });

    // ── Update ────────────────────────────────────────────────
    builder
      .addCase(updateCollectionCenter.pending, (state) => {
        state.updateLoading = true; state.updateError = null; state.updateSuccess = false;
      })
      .addCase(updateCollectionCenter.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        const updated = action.payload?.data ?? action.payload;
        // Patch the row in the list in-place
        const idx = state.list.findIndex(c => c.centre_id === updated?.centre_id);
        if (idx !== -1) state.list[idx] = updated;
        // Also update detail if open
        if (state.detail?.centre_id === updated?.centre_id) state.detail = updated;
      })
      .addCase(updateCollectionCenter.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError   = action.payload ?? { message: "Update failed." };
      });
  },
});

export const { resetSubmit, clearDistricts, resetUpdate, clearDetail, setPage } = collectionCenterSlice.actions;
export default collectionCenterSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectStates        = (state) => state.collectionCenter.states;
export const selectDistricts     = (state) => state.collectionCenter.districts;
export const selectStatesLoading = (state) => state.collectionCenter.statesLoading;
export const selectDistLoading   = (state) => state.collectionCenter.distLoading;
export const selectStatesError   = (state) => state.collectionCenter.statesError;

export const selectSubmitLoading = (state) => state.collectionCenter.submitLoading;
export const selectSubmitSuccess = (state) => state.collectionCenter.submitSuccess;
export const selectSubmitError   = (state) => state.collectionCenter.submitError;
export const selectCreatedCenter = (state) => state.collectionCenter.createdCenter;

export const selectList          = (state) => state.collectionCenter.list;
export const selectListLoading   = (state) => state.collectionCenter.listLoading;
export const selectListError     = (state) => state.collectionCenter.listError;
export const selectCurrentPage   = (state) => state.collectionCenter.currentPage;
export const selectPageSize      = (state) => state.collectionCenter.pageSize;
export const selectTotalCount    = (state) => state.collectionCenter.totalCount;

export const selectDetail        = (state) => state.collectionCenter.detail;
export const selectDetailLoading = (state) => state.collectionCenter.detailLoading;
export const selectDetailError   = (state) => state.collectionCenter.detailError;

export const selectUpdateLoading = (state) => state.collectionCenter.updateLoading;
export const selectUpdateError   = (state) => state.collectionCenter.updateError;
export const selectUpdateSuccess = (state) => state.collectionCenter.updateSuccess;
