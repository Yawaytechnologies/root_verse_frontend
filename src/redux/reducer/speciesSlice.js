import { createSlice } from "@reduxjs/toolkit";
import {
  fetchSpecies,
  addSpecies,
  editSpecies,
  removeSpecies,
} from "../action/speciesActions";

const initialState = {
  loading: false,
  error: null,
  list: [],

  creating: false,
  updatingById: {},
  deletingById: {},
};

function normalizeRow(payload) {
  // API can return direct object OR {data:{...}} etc.
  const row = payload?.data ?? payload;
  return row && typeof row === "object" ? row : null;
}

const speciesSlice = createSlice({
  name: "species",
  initialState,
  reducers: {
    clearSpeciesError(state) {
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b
      // -------- fetch --------
      .addCase(fetchSpecies.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchSpecies.fulfilled, (s, a) => {
        s.loading = false;
        s.list = Array.isArray(a.payload) ? a.payload : [];
      })
      .addCase(fetchSpecies.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || "Failed to fetch species";
      })

      // -------- create --------
      .addCase(addSpecies.pending, (s) => {
        s.creating = true;
        s.error = null;
      })
      .addCase(addSpecies.fulfilled, (s, a) => {
        s.creating = false;

        const created = normalizeRow(a.payload);
        if (created?.id != null) {
          // prevent duplicates if API returns existing row
          const exists = s.list.some((x) => x.id === created.id);
          s.list = exists ? s.list : [created, ...s.list];
        }
      })
      .addCase(addSpecies.rejected, (s, a) => {
        s.creating = false;
        s.error = a.payload || "Create failed";
      })

      // -------- update --------
      .addCase(editSpecies.pending, (s, a) => {
        const id = a.meta.arg?.id;
        if (id != null) s.updatingById[id] = true;
        s.error = null;
      })
      .addCase(editSpecies.fulfilled, (s, a) => {
        const id = a.payload?.id;
        if (id != null) delete s.updatingById[id];

        const idx = s.list.findIndex((x) => x.id === id);
        if (idx === -1) return;

        const serverData = normalizeRow(a.payload?.data) || {};
        // Always ensure we update name + code from thunk args (most reliable)
        s.list[idx] = {
          ...s.list[idx],
          ...serverData,
          fish_name: a.payload.fish_name,
          fish_code: a.payload.fish_code,
        };
      })
      .addCase(editSpecies.rejected, (s, a) => {
        const id = a.meta.arg?.id;
        if (id != null) delete s.updatingById[id];
        s.error = a.payload || "Update failed";
      })

      // -------- delete --------
      .addCase(removeSpecies.pending, (s, a) => {
        const id = a.meta.arg?.id;
        if (id != null) s.deletingById[id] = true;
        s.error = null;
      })
      .addCase(removeSpecies.fulfilled, (s, a) => {
        const id = a.payload?.id;
        if (id != null) delete s.deletingById[id];
        s.list = s.list.filter((x) => x.id !== id);
      })
      .addCase(removeSpecies.rejected, (s, a) => {
        const id = a.meta.arg?.id;
        if (id != null) delete s.deletingById[id];
        s.error = a.payload || "Delete failed";
      });
  },
});

export const { clearSpeciesError } = speciesSlice.actions;
export default speciesSlice.reducer;
