import { createSlice } from "@reduxjs/toolkit";
import { createCCOperator, fetchCCOperators } from "../action/collectionCentreOperatorActions";

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
};

const ccOperatorSlice = createSlice({
  name: "ccOperator",
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
  },

  extraReducers: (builder) => {
    // ── Create ────────────────────────────────────────────────
    builder
      .addCase(createCCOperator.pending, (state) => {
        state.submitLoading = true; state.submitSuccess = false; state.submitError = null;
      })
      .addCase(createCCOperator.fulfilled, (state, action) => {
        state.submitLoading   = false;
        state.submitSuccess   = true;
        state.createdOperator = action.payload?.data ?? action.payload;
      })
      .addCase(createCCOperator.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError   = action.payload ?? { message: "Something went wrong." };
      });

    // ── Fetch List ────────────────────────────────────────────
    builder
      .addCase(fetchCCOperators.pending, (state) => {
        state.listLoading = true; state.listError = null;
      })
      .addCase(fetchCCOperators.fulfilled, (state, action) => {
        state.listLoading = false;
        const payload     = action.payload;
        state.list        = Array.isArray(payload?.data) ? payload.data : [];
        state.totalCount  = payload?.total ?? payload?.meta?.total ?? null;
      })
      .addCase(fetchCCOperators.rejected, (state, action) => {
        state.listLoading = false;
        state.listError   = action.payload || "Failed to load operators.";
      });
  },
});

export const { resetSubmit: resetCCSubmit, setPage: setCCPage } = ccOperatorSlice.actions;
export default ccOperatorSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectCCSubmitLoading   = (state) => state.ccOperator.submitLoading;
export const selectCCSubmitSuccess   = (state) => state.ccOperator.submitSuccess;
export const selectCCSubmitError     = (state) => state.ccOperator.submitError;
export const selectCCCreatedOperator = (state) => state.ccOperator.createdOperator;

export const selectCCList        = (state) => state.ccOperator.list;
export const selectCCListLoading = (state) => state.ccOperator.listLoading;
export const selectCCListError   = (state) => state.ccOperator.listError;
export const selectCCCurrentPage = (state) => state.ccOperator.currentPage;
export const selectCCPageSize    = (state) => state.ccOperator.pageSize;
export const selectCCTotalCount  = (state) => state.ccOperator.totalCount;
