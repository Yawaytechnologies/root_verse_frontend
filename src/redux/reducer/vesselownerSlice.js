import { createSlice } from "@reduxjs/toolkit";
import { getWildCaptureOwners, updateOwnerVerification } from "../action/vesselownerActions";

const initialState = {
  list: [],
  loading: false,
  error: null,
  updatingById: {},
  updateErrorById: {},
};

const ownerSlice = createSlice({
  name: "owner",
  initialState,
  reducers: {
    clearOwnerError(state) {
      state.error = null;
    },
    clearUpdateError(state, action) {
      const id = action.payload;
      if (id) delete state.updateErrorById[id];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getWildCaptureOwners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWildCaptureOwners.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload || [];
      })
      .addCase(getWildCaptureOwners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch owners";
      })

      .addCase(updateOwnerVerification.pending, (state, action) => {
        const id = action.meta.arg.ownerId;
        state.updatingById[id] = true;
        state.updateErrorById[id] = null;
      })
      .addCase(updateOwnerVerification.fulfilled, (state, action) => {
        const { ownerId, data } = action.payload;
        state.updatingById[ownerId] = false;

        // backend response may or may not return full user
        const updated = data?.user || data?.updated_user || data?.data || data;

        const idx = state.list.findIndex((u) => String(u.id) === String(ownerId));
        if (idx !== -1 && updated && typeof updated === "object") {
          state.list[idx] = { ...state.list[idx], ...updated };
        } else if (idx !== -1) {
          // fallback if backend returns only success msg
          state.list[idx] = { ...state.list[idx], verification_status: "VERIFIED" };
        }
      })
      .addCase(updateOwnerVerification.rejected, (state, action) => {
        const id = action.meta.arg.ownerId;
        state.updatingById[id] = false;
        state.updateErrorById[id] = action.payload || "Update failed";
      });
  },
});

export const { clearOwnerError, clearUpdateError } = ownerSlice.actions;
export default ownerSlice.reducer;
