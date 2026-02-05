import { createSlice } from "@reduxjs/toolkit";
import { fetchSpecies, addSpecies, editSpecies, removeSpecies } from "../action/speciesActions";

const initialState = {
  loading: false,
  error: null,
  list: [],

  creating: false,
  updatingById: {},
  deletingById: {},
};

function normalizeRow(payload) {
  // supports: row OR {data: row} OR {success:true,data:row}
  const row = payload?.data ?? payload;
  if (!row || typeof row !== "object" || Array.isArray(row)) return null;
  return row;
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

        // ✅ created should contain fish_type_url (saved by backend)
        const created = normalizeRow(a.payload);
        if (created?.id != null) {
          const idx = s.list.findIndex((x) => x.id === created.id);
          if (idx === -1) {
            s.list = [created, ...s.list];
          } else {
            // replace if already exists
            s.list[idx] = { ...s.list[idx], ...created };
          }
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

        // server can return updated row containing fish_type_url
        const serverData = normalizeRow(a.payload?.data) || {};

        s.list[idx] = {
          ...s.list[idx],
          ...serverData, // ✅ keep fish_type_url here
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
