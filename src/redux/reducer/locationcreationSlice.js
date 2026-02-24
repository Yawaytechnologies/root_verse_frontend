import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { geoService } from "../services/locationcreationServices";

const errMsg = (e) =>
  e?.response?.data?.message ||
  e?.response?.data?.error ||
  e?.response?.data?.detail ||
  e?.message ||
  "Request failed";

// Normalize ANY backend response into an array (only for list endpoints)
const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;

  const wrapped =
    payload?.data ||
    payload?.countries ||
    payload?.states ||
    payload?.districts ||
    payload?.locations ||
    payload?.rows ||
    payload?.result;

  if (Array.isArray(wrapped)) return wrapped;

  // DON'T wrap random objects for list fetch calls unless it looks like a row
  if (
    payload &&
    typeof payload === "object" &&
    (payload.id != null || payload.name || payload.code)
  ) {
    return [payload];
  }

  return [];
};

// ----------- COUNTRY -----------
export const fetchCountries = createAsyncThunk(
  "location/fetchCountries",
  async (_, thunkAPI) => {
    try {
      return await geoService.getCountries();
    } catch (e) {
      return thunkAPI.rejectWithValue(errMsg(e));
    }
  }
);

export const createCountry = createAsyncThunk(
  "location/createCountry",
  async (payload, thunkAPI) => {
    try {
      return await geoService.createCountry(payload);
    } catch (e) {
      return thunkAPI.rejectWithValue(errMsg(e));
    }
  }
);

// ----------- STATE -----------
export const fetchStates = createAsyncThunk(
  "location/fetchStates",
  async ({ countryId } = {}, thunkAPI) => {
    try {
      return await geoService.getStates({ countryId });
    } catch (e) {
      return thunkAPI.rejectWithValue(errMsg(e));
    }
  }
);

export const createState = createAsyncThunk(
  "location/createState",
  async (payload, thunkAPI) => {
    try {
      return await geoService.createState(payload);
    } catch (e) {
      return thunkAPI.rejectWithValue(errMsg(e));
    }
  }
);

// ----------- DISTRICT -----------
export const fetchDistricts = createAsyncThunk(
  "location/fetchDistricts",
  async ({ stateId } = {}, thunkAPI) => {
    try {
      return await geoService.getDistricts({ stateId });
    } catch (e) {
      return thunkAPI.rejectWithValue(errMsg(e));
    }
  }
);

export const createDistrict = createAsyncThunk(
  "location/createDistrict",
  async (payload, thunkAPI) => {
    try {
      return await geoService.createDistrict(payload);
    } catch (e) {
      return thunkAPI.rejectWithValue(errMsg(e));
    }
  }
);

// ----------- LOCATION (PORT) -----------
export const fetchLocations = createAsyncThunk(
  "location/fetchLocations",
  async ({ stateId, districtId } = {}, thunkAPI) => {
    try {
      return await geoService.getLocations({ stateId, districtId });
    } catch (e) {
      return thunkAPI.rejectWithValue(errMsg(e));
    }
  }
);

export const createLocation = createAsyncThunk(
  "location/createLocation",
  async (payload, thunkAPI) => {
    try {
      return await geoService.createLocation(payload);
    } catch (e) {
      return thunkAPI.rejectWithValue(errMsg(e));
    }
  }
);

const initialState = {
  countries: [],
  states: [],
  districts: [],
  locations: [],
  loading: false,
  error: null,
  lastSuccess: null,
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    clearGeoStatus: (state) => {
      state.error = null;
      state.lastSuccess = null;
    },
    clearDistricts: (state) => {
      state.districts = [];
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.loading = true;
      state.error = null;
      state.lastSuccess = null;
    };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload || "Request failed";
    };

    builder
      // ================== COUNTRIES ==================
      .addCase(fetchCountries.pending, pending)
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.loading = false;
        state.countries = toArray(action.payload);
      })
      .addCase(fetchCountries.rejected, rejected)

      .addCase(createCountry.pending, pending)
      .addCase(createCountry.fulfilled, (state) => {
        state.loading = false;
        state.lastSuccess = "Country created";
      })
      .addCase(createCountry.rejected, rejected)

      // ================== STATES ==================
      .addCase(fetchStates.pending, pending)
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.loading = false;
        state.states = toArray(action.payload);
      })
      .addCase(fetchStates.rejected, rejected)

      .addCase(createState.pending, pending)
      .addCase(createState.fulfilled, (state) => {
        state.loading = false;
        state.lastSuccess = "State created";
      })
      .addCase(createState.rejected, rejected)

      // ================== DISTRICTS ==================
      .addCase(fetchDistricts.pending, pending)
      .addCase(fetchDistricts.fulfilled, (state, action) => {
        state.loading = false;

        // ✅ IMPORTANT FIX:
        // Merge districts by id so multiple fetchDistricts calls (for each state) won't overwrite.
        const incoming = toArray(action.payload);

        const map = new Map(state.districts.map((d) => [d.id, d]));
        for (const d of incoming) {
          if (d?.id != null) map.set(d.id, d);
        }
        state.districts = Array.from(map.values());
      })
      .addCase(fetchDistricts.rejected, rejected)

      .addCase(createDistrict.pending, pending)
      .addCase(createDistrict.fulfilled, (state) => {
        state.loading = false;
        state.lastSuccess = "District created";
      })
      .addCase(createDistrict.rejected, rejected)

      // ================== LOCATIONS ==================
      .addCase(fetchLocations.pending, pending)
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = toArray(action.payload);
      })
      .addCase(fetchLocations.rejected, rejected)

      .addCase(createLocation.pending, pending)
      .addCase(createLocation.fulfilled, (state) => {
        state.loading = false;
        state.lastSuccess = "Port(Location) created";
      })
      .addCase(createLocation.rejected, rejected);
  },
});

export const { clearGeoStatus, clearDistricts } = locationSlice.actions;

// ✅ selectors
export const selectCountries = (s) => s.location?.countries ?? [];
export const selectStates = (s) => s.location?.states ?? [];
export const selectDistricts = (s) => s.location?.districts ?? [];
export const selectLocations = (s) => s.location?.locations ?? [];
export const selectGeoLoading = (s) => s.location?.loading ?? false;
export const selectGeoError = (s) => s.location?.error ?? null;
export const selectGeoSuccess = (s) => s.location?.lastSuccess ?? null;

export default locationSlice.reducer;