// src/redux/reducer/fishingMethodSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchFishingMethodsThunk,
  createFishingMethodThunk,
  updateFishingMethodThunk,
  deleteFishingMethodThunk,
} from "../action/fishingMethodActions";

const initialState = {
  items: [],
  loading: false,

  creating: false,
  updating: false,
  deleting: false,

  error: null,
  success: null, // string message
};

const fishingMethodSlice = createSlice({
  name: "fishingMethods",
  initialState,
  reducers: {
    clearFishingMethodStatus(state) {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchFishingMethodsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFishingMethodsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchFishingMethodsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load fishing methods";
      });

    // Create
    builder
      .addCase(createFishingMethodThunk.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createFishingMethodThunk.fulfilled, (state, action) => {
        state.creating = false;
        state.success = "Fishing method created";
        const created = action.payload;

        // backend might return created object or full list
        if (Array.isArray(created)) {
          state.items = created;
        } else if (created?.id) {
          state.items = [created, ...state.items];
        }
      })
      .addCase(createFishingMethodThunk.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || "Failed to create fishing method";
      });

    // Update
    builder
      .addCase(updateFishingMethodThunk.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateFishingMethodThunk.fulfilled, (state, action) => {
        state.updating = false;
        state.success = "Fishing method updated";
        const updated = action.payload;

        if (Array.isArray(updated)) {
          state.items = updated;
          return;
        }

        if (updated?.id) {
          const idx = state.items.findIndex((x) => x.id === updated.id);
          if (idx !== -1) state.items[idx] = updated;
        }
      })
      .addCase(updateFishingMethodThunk.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || "Failed to update fishing method";
      });

    // Delete
    builder
      .addCase(deleteFishingMethodThunk.pending, (state) => {
        state.deleting = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteFishingMethodThunk.fulfilled, (state, action) => {
        state.deleting = false;
        state.success = "Fishing method deleted";
        const id = action.payload;
        state.items = state.items.filter((x) => x.id !== id);
      })
      .addCase(deleteFishingMethodThunk.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload || "Failed to delete fishing method";
      });
  },
});

export const { clearFishingMethodStatus } = fishingMethodSlice.actions;
export default fishingMethodSlice.reducer;
