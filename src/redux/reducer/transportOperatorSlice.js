// src/redux/reducer/transportOperatorSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  createTransportOperator,
  fetchTransportOperators,
  updateTransportOperatorStatus,
} from "../action/transportOperatorActions";

const initialState = {
  // ── Create ────────────────────────────────────────────────
  submitLoading:   false,
  submitSuccess:   false,
  submitError:     null,
  createdOperator: null,

  // ── List ──────────────────────────────────────────────────
  list:        [],
  listLoading: false,
  listError:   null,
  currentPage: 1,
  pageSize:    20,
  totalCount:  null,

  // ── Status update ─────────────────────────────────────────
  statusUpdatingId: null,  // operatorId currently being patched
  statusError:      null,
};

const transportOperatorSlice = createSlice({
  name: "transportOperator",
  initialState,

  reducers: {
    resetSubmit(state) {
      state.submitLoading   = false;
      state.submitSuccess   = false;
      state.submitError     = null;
      state.createdOperator = null;
    },
    setPage(state, action) {
      state.currentPage = action.payload;
    },
    clearStatusError(state) {
      state.statusError = null;
    },
  },

  extraReducers: (builder) => {

    // ── Create ────────────────────────────────────────────────
    builder
      .addCase(createTransportOperator.pending, (state) => {
        state.submitLoading = true;
        state.submitSuccess = false;
        state.submitError   = null;
      })
      .addCase(createTransportOperator.fulfilled, (state, action) => {
        state.submitLoading   = false;
        state.submitSuccess   = true;
        state.createdOperator = action.payload?.data ?? action.payload;
      })
      .addCase(createTransportOperator.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError   = action.payload ?? { message: "Something went wrong." };
      });

    // ── Fetch list ────────────────────────────────────────────
    builder
      .addCase(fetchTransportOperators.pending, (state) => {
        state.listLoading = true;
        state.listError   = null;
      })
      .addCase(fetchTransportOperators.fulfilled, (state, action) => {
        state.listLoading = false;
        const payload     = action.payload;
        state.list        = Array.isArray(payload?.data) ? payload.data : [];
        state.totalCount  = payload?.total ?? payload?.meta?.total ?? null;
      })
      .addCase(fetchTransportOperators.rejected, (state, action) => {
        state.listLoading = false;
        state.listError   = action.payload || "Failed to load operators.";
      });

    // ── Status update — optimistic patch on fulfilled ─────────
    builder
      .addCase(updateTransportOperatorStatus.pending, (state, action) => {
        state.statusUpdatingId = action.meta.arg.operatorId;
        state.statusError      = null;
      })
      .addCase(updateTransportOperatorStatus.fulfilled, (state, action) => {
        state.statusUpdatingId = null;
        const updated = action.payload?.data;
        if (updated?.operator_rv_id) {
          const idx = state.list.findIndex(r => r.user_id === updated.operator_rv_id);
          if (idx !== -1) state.list[idx].is_active = updated.is_active;
        }
      })
      .addCase(updateTransportOperatorStatus.rejected, (state, action) => {
        state.statusUpdatingId = null;
        state.statusError      = action.payload || "Failed to update status.";
      });
  },
});

export const {
  resetSubmit: resetTransportSubmit,
  setPage:     setTransportPage,
  clearStatusError,
} = transportOperatorSlice.actions;

export default transportOperatorSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectTransportSubmitLoading   = s => s.transportOperator.submitLoading;
export const selectTransportSubmitSuccess   = s => s.transportOperator.submitSuccess;
export const selectTransportSubmitError     = s => s.transportOperator.submitError;
export const selectTransportCreatedOperator = s => s.transportOperator.createdOperator;

export const selectTransportList            = s => s.transportOperator.list;
export const selectTransportListLoading     = s => s.transportOperator.listLoading;
export const selectTransportListError       = s => s.transportOperator.listError;
export const selectTransportCurrentPage     = s => s.transportOperator.currentPage;
export const selectTransportPageSize        = s => s.transportOperator.pageSize;
export const selectTransportTotalCount      = s => s.transportOperator.totalCount;

export const selectStatusUpdatingId         = s => s.transportOperator.statusUpdatingId;
export const selectStatusError              = s => s.transportOperator.statusError;