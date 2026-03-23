// src/redux/reducer/qualityCheckerSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchQualityCheckers,
  fetchQualityCheckerByCodeThunk,
  createQualityCheckerThunk,
  updateQualityCheckerThunk,
  deleteQualityCheckerThunk,
  fetchStatesThunk,
  fetchDistrictsThunk,
  fetchLocationsThunk,
  fetchDistrictsByStateThunk,
  fetchLocationsByStateThunk,
} from "../action/qualitycheckerActions";

const initialState = {
  loading: false,
  error: null,
  list: [],

  creating: false,

  updatingById: {},
  updateErrorById: {},

  deletingById: {},

  searching: false,
  searchError: null,
  selected: null,

  states: [],
  statesLoading: false,
  statesError: null,

  districts: [],
  districtsLoading: false,
  districtsError: null,

  locations: [],
  locationsLoading: false,
  locationsError: null,
};

const qualityCheckerSlice = createSlice({
  name: "qualityChecker",
  initialState,
  reducers: {
    clearQualityCheckerError(state) {
      state.error = null;
    },
    clearSearch(state) {
      state.searchError = null;
      state.selected = null;
      state.searching = false;
    },
    clearUpdateError(state, action) {
      const id = action.payload;
      if (id != null) delete state.updateErrorById[id];
    },
    clearDistrictsAndLocations(state) {
      state.districts = [];
      state.locations = [];
      state.districtsError = null;
      state.locationsError = null;
    },
  },
  extraReducers: (b) => {
    b
      // fetch all
      .addCase(fetchQualityCheckers.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchQualityCheckers.fulfilled, (s, a) => {
        s.loading = false;
        s.list = Array.isArray(a.payload) ? a.payload : [];
      })
      .addCase(fetchQualityCheckers.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || "Failed to fetch";
      })

      // create
      .addCase(createQualityCheckerThunk.pending, (s) => {
        s.creating = true;
        s.error = null;
      })
      .addCase(createQualityCheckerThunk.fulfilled, (s, a) => {
        s.creating = false;
        const created = a.payload;
        if (created && typeof created === "object") {
          s.list = [created, ...s.list];
        }
      })
      .addCase(createQualityCheckerThunk.rejected, (s, a) => {
        s.creating = false;
        s.error = a.payload || "Create failed";
      })

      // view by code
      .addCase(fetchQualityCheckerByCodeThunk.pending, (s) => {
        s.searching = true;
        s.searchError = null;
        s.selected = null;
      })
      .addCase(fetchQualityCheckerByCodeThunk.fulfilled, (s, a) => {
        s.searching = false;
        s.selected = a.payload || null;
      })
      .addCase(fetchQualityCheckerByCodeThunk.rejected, (s, a) => {
        s.searching = false;
        s.searchError = a.payload || "Search failed";
      })

      // update
      .addCase(updateQualityCheckerThunk.pending, (s, a) => {
        const id = a.meta.arg?.id;
        if (id != null) s.updatingById[id] = true;
        if (id != null) delete s.updateErrorById[id];
      })
      .addCase(updateQualityCheckerThunk.fulfilled, (s, a) => {
        const id = a.payload?.id;
        if (id != null) delete s.updatingById[id];
        const idx = s.list.findIndex((x) => x.id === id);
        if (idx !== -1) {
          s.list[idx] = { ...s.list[idx], ...(a.payload.updated || {}) };
        }
      })
      .addCase(updateQualityCheckerThunk.rejected, (s, a) => {
        const id = a.meta.arg?.id;
        if (id != null) delete s.updatingById[id];
        if (id != null) s.updateErrorById[id] = a.payload || "Update failed";
      })

      // delete
      .addCase(deleteQualityCheckerThunk.pending, (s, a) => {
        const id = a.meta.arg?.id;
        if (id != null) s.deletingById[id] = true;
        s.error = null;
      })
      .addCase(deleteQualityCheckerThunk.fulfilled, (s, a) => {
        const id = a.payload?.id;
        if (id != null) delete s.deletingById[id];
        s.list = s.list.filter((x) => x.id !== id);
      })
      .addCase(deleteQualityCheckerThunk.rejected, (s, a) => {
        const id = a.meta.arg?.id;
        if (id != null) delete s.deletingById[id];
        s.error = a.payload || "Delete failed";
      })

      // states
      .addCase(fetchStatesThunk.pending, (s) => {
        s.statesLoading = true;
        s.statesError = null;
      })
      .addCase(fetchStatesThunk.fulfilled, (s, a) => {
        s.statesLoading = false;
        s.states = Array.isArray(a.payload) ? a.payload : [];
      })
      .addCase(fetchStatesThunk.rejected, (s, a) => {
        s.statesLoading = false;
        s.statesError = a.payload || "Failed to fetch states";
      })

      // districts (all) — legacy
      .addCase(fetchDistrictsThunk.pending, (s) => {
        s.districtsLoading = true;
        s.districtsError = null;
      })
      .addCase(fetchDistrictsThunk.fulfilled, (s, a) => {
        s.districtsLoading = false;
        s.districts = Array.isArray(a.payload) ? a.payload : [];
      })
      .addCase(fetchDistrictsThunk.rejected, (s, a) => {
        s.districtsLoading = false;
        s.districtsError = a.payload || "Failed to fetch districts";
      })

      // locations (all) — legacy
      .addCase(fetchLocationsThunk.pending, (s) => {
        s.locationsLoading = true;
        s.locationsError = null;
      })
      .addCase(fetchLocationsThunk.fulfilled, (s, a) => {
        s.locationsLoading = false;
        s.locations = Array.isArray(a.payload) ? a.payload : [];
      })
      .addCase(fetchLocationsThunk.rejected, (s, a) => {
        s.locationsLoading = false;
        s.locationsError = a.payload || "Failed to fetch locations";
      })

      // districts by state
      .addCase(fetchDistrictsByStateThunk.pending, (s) => {
        s.districtsLoading = true;
        s.districtsError = null;
        s.districts = [];
      })
      .addCase(fetchDistrictsByStateThunk.fulfilled, (s, a) => {
        s.districtsLoading = false;
        s.districts = Array.isArray(a.payload) ? a.payload : [];
      })
      .addCase(fetchDistrictsByStateThunk.rejected, (s, a) => {
        s.districtsLoading = false;
        s.districtsError = a.payload || "Failed to fetch districts";
      })

      // locations by state
      .addCase(fetchLocationsByStateThunk.pending, (s) => {
        s.locationsLoading = true;
        s.locationsError = null;
        s.locations = [];
      })
      .addCase(fetchLocationsByStateThunk.fulfilled, (s, a) => {
        s.locationsLoading = false;
        s.locations = Array.isArray(a.payload) ? a.payload : [];
      })
      .addCase(fetchLocationsByStateThunk.rejected, (s, a) => {
        s.locationsLoading = false;
        s.locationsError = a.payload || "Failed to fetch locations";
      });
  },
});

export const {
  clearQualityCheckerError,
  clearSearch,
  clearUpdateError,
  clearDistrictsAndLocations,
} = qualityCheckerSlice.actions;

export default qualityCheckerSlice.reducer;