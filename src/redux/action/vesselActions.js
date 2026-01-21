// src/redux/action/vesselActions.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchVesselsApi, createVesselApi, updateVesselApi } from "../services/vesselServices";
import { fetchOwnersWildCaptureApi } from "../services/ownerlookupServices";

export const fetchVessels = createAsyncThunk(
  "vessel/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchVesselsApi();
      // backend may return array OR {data:[...]}
      return Array.isArray(data) ? data : data?.data || [];
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to fetch vessels");
    }
  }
);

export const createVessel = createAsyncThunk(
  "vessel/create",
  async (payload, { rejectWithValue }) => {
    try {
      // payload must match backend keys
      const data = await createVesselApi(payload);
      return data?.data ?? data; // normalize
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to create vessel");
    }
  }
);

export const updateVessel = createAsyncThunk(
  "vessel/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const data = await updateVesselApi(id, payload);
      return { id, data: data?.data ?? data, payload };
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to update vessel");
    }
  }
);

export const fetchOwnersForVesselDropdown = createAsyncThunk(
  "vessel/fetchOwners",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchOwnersWildCaptureApi();
      return Array.isArray(data) ? data : data?.users || [];
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to fetch owners");
    }
  }
);
