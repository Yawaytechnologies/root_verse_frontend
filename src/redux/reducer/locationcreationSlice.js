import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { geoService } from "../services/locationcreationServices";

const errMsg = (e) =>
  e?.response?.data?.message ||
  e?.response?.data?.error ||
  e?.message ||
  "Request failed";

// Normalize ANY backend response into an array
const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;

  const wrapped =
    payload?.data ||
    payload?.states ||
    payload?.districts ||
    payload?.locations ||
    payload?.rows ||
    payload?.result;

  if (Array.isArray(wrapped)) return wrapped;

  if (payload && typeof payload === "object") return [payload];

  return [];
};

export const fetchStates = createAsyncThunk("location/fetchStates", async (_, thunkAPI) => {
  try {
    return await geoService.getStates();
  } catch (e) {
    return thunkAPI.rejectWithValue(errMsg(e));
  }
});

export const createState = createAsyncThunk("location/createState", async (payload, thunkAPI) => {
  try {
    return await geoService.createState(payload);
  } catch (e) {
    return thunkAPI.rejectWithValue(errMsg(e));
  }
});

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

export const createDistrict = createAsyncThunk("location/createDistrict", async (payload, thunkAPI) => {
  try {
    return await geoService.createDistrict(payload);
  } catch (e) {
    return thunkAPI.rejectWithValue(errMsg(e));
  }
});

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

export const createLocation = createAsyncThunk("location/createLocation", async (payload, thunkAPI) => {
  try {
    return await geoService.createLocation(payload);
  } catch (e) {
    return thunkAPI.rejectWithValue(errMsg(e));
  }
});

const initialState = {
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
      // STATES
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

      // DISTRICTS
      .addCase(fetchDistricts.pending, (state) => {
        pending(state);
        state.districts = []; // wipe old districts so dropdown doesn't show wrong data
      })
      .addCase(fetchDistricts.fulfilled, (state, action) => {
        state.loading = false;
        state.districts = toArray(action.payload);
      })
      .addCase(fetchDistricts.rejected, rejected)

      .addCase(createDistrict.pending, pending)
      .addCase(createDistrict.fulfilled, (state) => {
        state.loading = false;
        state.lastSuccess = "District created";
      })
      .addCase(createDistrict.rejected, rejected)

      // LOCATIONS
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

export const selectStates = (s) => s.location?.states ?? [];
export const selectDistricts = (s) => s.location?.districts ?? [];
export const selectLocations = (s) => s.location?.locations ?? [];
export const selectGeoLoading = (s) => s.location?.loading ?? false;
export const selectGeoError = (s) => s.location?.error ?? null;
export const selectGeoSuccess = (s) => s.location?.lastSuccess ?? null;

export default locationSlice.reducer;
