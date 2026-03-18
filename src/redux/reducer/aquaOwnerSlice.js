
import { createSlice } from "@reduxjs/toolkit";
import { fetchAllOwners, approveOwner, rejectOwner } from "../action/aquaOwnerActions";

const initialState = {
  owners:    [],
  loading:   false,
  updating:  {},   // { [ownerId]: boolean }
  updateError: {}, // { [ownerId]: string | null }
  error:     null,
};

function replaceOwner(owners, updated) {
  const idx = owners.findIndex((o) => o.id === updated.id);
  if (idx === -1) return owners;
  const next = [...owners];
  next[idx] = updated;
  return next;
}

/** Normalize any API shape → always an array */
function toArray(payload) {
  if (Array.isArray(payload))                    return payload;
  if (payload && Array.isArray(payload.users))   return payload.users;   // ← this API
  if (payload && Array.isArray(payload.data))    return payload.data;
  if (payload && Array.isArray(payload.owners))  return payload.owners;
  if (payload && Array.isArray(payload.results)) return payload.results;
  if (payload && typeof payload === "object")    return Object.values(payload);
  return [];
}

const ownerApprovalSlice = createSlice({
  name: "ownerApproval",
  initialState,

  reducers: {
    clearError(state)      { state.error = null; },
    clearOwnerError(state, { payload: id }) { delete state.updateError[id]; },
  },

  extraReducers: (builder) => {
    /* fetchAllOwners */
    builder
      .addCase(fetchAllOwners.pending,   (s)    => { s.loading = true;  s.error = null; })
      .addCase(fetchAllOwners.fulfilled, (s, a) => { s.loading = false; s.owners = toArray(a.payload); })
      .addCase(fetchAllOwners.rejected,  (s, a) => { s.loading = false; s.error = a.payload ?? "Failed to fetch owners"; });

    /* approveOwner */
    builder
      .addCase(approveOwner.pending, (s, a) => {
        s.updating[a.meta.arg.id] = true;
        delete s.updateError[a.meta.arg.id];
      })
      .addCase(approveOwner.fulfilled, (s, a) => {
        const u = a.payload;
        s.updating[u.id] = false;
        s.owners = replaceOwner(s.owners, u);
      })
      .addCase(approveOwner.rejected, (s, a) => {
        const id = a.meta.arg.id;
        s.updating[id] = false;
        s.updateError[id] = a.payload ?? "Approval failed";
      });

    /* rejectOwner */
    builder
      .addCase(rejectOwner.pending, (s, a) => {
        s.updating[a.meta.arg.id] = true;
        delete s.updateError[a.meta.arg.id];
      })
      .addCase(rejectOwner.fulfilled, (s, a) => {
        const u = a.payload;
        s.updating[u.id] = false;
        s.owners = replaceOwner(s.owners, u);
      })
      .addCase(rejectOwner.rejected, (s, a) => {
        const id = a.meta.arg.id;
        s.updating[id] = false;
        s.updateError[id] = a.payload ?? "Rejection failed";
      });
  },
});

export const { clearError, clearOwnerError } = ownerApprovalSlice.actions;

/* Selectors — key in store is "ownerApproval" */
export const selectAllOwners      = (s) => s.aquaOwnerApproval?.owners ?? [];
export const selectPendingOwners  = (s) => s.aquaOwnerApproval?.owners?.filter((o) => o.verification_status === "PENDING")  ?? [];
export const selectApprovedOwners = (s) => s.aquaOwnerApproval?.owners?.filter((o) => o.verification_status === "VERIFIED") ?? [];
export const selectRejectedOwners = (s) => s.aquaOwnerApproval?.owners?.filter((o) => o.verification_status === "REJECTED") ?? [];
export const selectOwnersLoading  = (s) => s.aquaOwnerApproval?.loading ?? false;
export const selectOwnersError    = (s) => s.aquaOwnerApproval?.error ?? null;

export default ownerApprovalSlice.reducer;