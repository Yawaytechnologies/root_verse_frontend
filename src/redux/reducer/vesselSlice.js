// src/redux/reducer/vesselSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchVessels,
  createVessel,
  updateVessel,
  fetchOwnersForVesselDropdown,
} from "../action/vesselActions";

const initialState = {
  loading: false,
  error: null,
  list: [],

  creating: false,
  updatingById: {},

  ownersLoading: false,
  ownersError: null,
  owners: [],
};

const vesselSlice = createSlice({
  name: "vessel",
  initialState,
  reducers: {
    clearVesselError(s) {
      s.error = null;
    },
    clearOwnersError(s) {
      s.ownersError = null;
    },
  },
  extraReducers: (b) => {
    b
      // ---- vessels list ----
      .addCase(fetchVessels.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchVessels.fulfilled, (s, a) => {
        s.loading = false;
        s.list = Array.isArray(a.payload) ? a.payload : [];
      })
      .addCase(fetchVessels.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || "Failed to fetch vessels";
      })

      // ---- create ----
      .addCase(createVessel.pending, (s) => {
        s.creating = true;
        s.error = null;
      })
      .addCase(createVessel.fulfilled, (s, a) => {
        s.creating = false;
        const created = a.payload && typeof a.payload === "object" ? a.payload : null;
        if (created?.id != null) {
          const exists = s.list.some((x) => x.id === created.id);
          if (!exists) s.list = [created, ...s.list];
        }
      })
      .addCase(createVessel.rejected, (s, a) => {
        s.creating = false;
        s.error = a.payload || "Create failed";
      })

      // ---- update ----
      .addCase(updateVessel.pending, (s, a) => {
        const id = a.meta.arg?.id;
        if (id != null) s.updatingById[id] = true;
        s.error = null;
      })
      .addCase(updateVessel.fulfilled, (s, a) => {
        const id = a.payload?.id;
        if (id != null) delete s.updatingById[id];

        const idx = s.list.findIndex((x) => x.id === id);
        if (idx !== -1) {
          const server = a.payload?.data && typeof a.payload.data === "object" ? a.payload.data : {};
          s.list[idx] = { ...s.list[idx], ...server, ...a.payload.payload };
        }
      })
      .addCase(updateVessel.rejected, (s, a) => {
        const id = a.meta.arg?.id;
        if (id != null) delete s.updatingById[id];
        s.error = a.payload || "Update failed";
      })

      // ---- owners dropdown ----
      .addCase(fetchOwnersForVesselDropdown.pending, (s) => {
        s.ownersLoading = true;
        s.ownersError = null;
      })
      .addCase(fetchOwnersForVesselDropdown.fulfilled, (s, a) => {
        s.ownersLoading = false;
        s.owners = Array.isArray(a.payload) ? a.payload : [];
      })
      .addCase(fetchOwnersForVesselDropdown.rejected, (s, a) => {
        s.ownersLoading = false;
        s.ownersError = a.payload || "Failed to fetch owners";
      });
  },
});

export const { clearVesselError, clearOwnersError } = vesselSlice.actions;
export default vesselSlice.reducer;
