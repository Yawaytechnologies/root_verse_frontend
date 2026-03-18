/**
 * pondSlice.js
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
  updating:      {},   // { [pondId]: boolean }
  updateError:   {},   // { [pondId]: string | null }
  error:         null,
};

function replacePondInList(ponds, updated) {
  const idx = ponds.findIndex((p) => p.id === updated.id);
  if (idx === -1) return ponds;
  const next = [...ponds];
  next[idx] = updated;
  return next;
}

const pondSlice = createSlice({
  name: "ponds",
  initialState,

  reducers: {
    clearError(state)                { state.error = null; },
    clearPondUpdateError(state, { payload: id }) { delete state.updateError[id]; },
    clearSelectedPond(state)         { state.selectedPond = null; },
  },

  extraReducers: (builder) => {
    /* fetchAllPonds */
    builder
      .addCase(fetchAllPonds.pending,   (s)    => { s.loading = true;  s.error = null; })
      .addCase(fetchAllPonds.fulfilled, (s, a) => { s.loading = false; s.ponds = a.payload; })
      .addCase(fetchAllPonds.rejected,  (s, a) => { s.loading = false; s.error = a.payload ?? "Failed to fetch ponds"; });

    /* fetchPondById */
    builder
      .addCase(fetchPondById.pending,   (s)    => { s.detailLoading = true; })
      .addCase(fetchPondById.fulfilled, (s, a) => { s.detailLoading = false; s.selectedPond = a.payload; })
      .addCase(fetchPondById.rejected,  (s)    => { s.detailLoading = false; });

    /* approvePond */
    builder
      .addCase(approvePond.pending, (s, a) => {
        s.updating[a.meta.arg.id] = true;
        delete s.updateError[a.meta.arg.id];
      })
      .addCase(approvePond.fulfilled, (s, a) => {
        const u = a.payload;
        s.updating[u.id] = false;
        s.ponds = replacePondInList(s.ponds, u);
        if (s.selectedPond?.id === u.id) s.selectedPond = u;
      })
      .addCase(approvePond.rejected, (s, a) => {
        const id = a.meta.arg.id;
        s.updating[id] = false;
        s.updateError[id] = a.payload ?? "Approval failed";
      });

    /* rejectPond */
    builder
      .addCase(rejectPond.pending, (s, a) => {
        s.updating[a.meta.arg.id] = true;
        delete s.updateError[a.meta.arg.id];
      })
      .addCase(rejectPond.fulfilled, (s, a) => {
        const u = a.payload;
        s.updating[u.id] = false;
        s.ponds = replacePondInList(s.ponds, u);
        if (s.selectedPond?.id === u.id) s.selectedPond = u;
      })
      .addCase(rejectPond.rejected, (s, a) => {
        const id = a.meta.arg.id;
        s.updating[id] = false;
        s.updateError[id] = a.payload ?? "Rejection failed";
      });

    /* updatePond */
    builder
      .addCase(updatePond.pending,   (s, a) => { s.updating[a.meta.arg.id] = true; })
      .addCase(updatePond.fulfilled, (s, a) => {
        const u = a.payload;
        s.updating[u.id] = false;
        s.ponds = replacePondInList(s.ponds, u);
        if (s.selectedPond?.id === u.id) s.selectedPond = u;
      })
      .addCase(updatePond.rejected, (s, a) => {
        const id = a.meta.arg.id;
        s.updating[id] = false;
        s.updateError[id] = a.payload ?? "Update failed";
      });
  },
});

/* Actions */
export const { clearError, clearPondUpdateError, clearSelectedPond } = pondSlice.actions;

/* Selectors */
export const selectAllPonds      = (s) => s.pondApproval.ponds;
export const selectPendingPonds  = (s) => s.pondApproval.ponds.filter((p) => p.status === "pending");
export const selectApprovedPonds = (s) => s.pondApproval.ponds.filter((p) => p.status === "approved");
export const selectRejectedPonds = (s) => s.pondApproval.ponds.filter((p) => p.status === "rejected");
export const selectPondsLoading  = (s) => s.pondApproval.loading;
export const selectPondsError    = (s) => s.pondApproval.error;
export const selectSelectedPond  = (s) => s.pondApproval.selectedPond;

export default pondSlice.reducer;