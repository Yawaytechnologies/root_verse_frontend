// src/redux/action/qualitycheckerActions.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllQualityCheckers,
  getQualityCheckerByCode,
  createQualityChecker,
  updateQualityChecker,
  deleteQualityChecker,
  getAllLocations,
  getDistrictsByState,
  getLocationsByState,
} from "../services/qualitycheckerServices";

import { getAllStates, getAllDistricts } from "../services/locationServices";

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.locations)) return data.locations;
  if (Array.isArray(data?.districts)) return data.districts;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function normalizeOne(data) {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data?.data && typeof data.data === "object" ? data.data : data;
  }
  return null;
}

export const fetchQualityCheckers = createAsyncThunk(
  "qualityChecker/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllQualityCheckers();
      return normalizeList(data);
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to fetch quality checkers");
    }
  }
);

export const fetchQualityCheckerByCodeThunk = createAsyncThunk(
  "qualityChecker/fetchByCode",
  async ({ code }, { rejectWithValue }) => {
    try {
      const data = await getQualityCheckerByCode(code);
      const one = normalizeOne(data);
      if (!one) throw new Error("Invalid response");
      return one;
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to fetch by code");
    }
  }
);

export const createQualityCheckerThunk = createAsyncThunk(
  "qualityChecker/create",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await createQualityChecker(payload);
      return normalizeOne(data) ?? payload;
    } catch (err) {
      return rejectWithValue(err?.message || "Create failed");
    }
  }
);

export const updateQualityCheckerThunk = createAsyncThunk(
  "qualityChecker/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const data = await updateQualityChecker(id, payload);
      return { id, updated: normalizeOne(data) ?? payload };
    } catch (err) {
      return rejectWithValue(err?.message || "Update failed");
    }
  }
);

export const deleteQualityCheckerThunk = createAsyncThunk(
  "qualityChecker/delete",
  async ({ id }, { rejectWithValue }) => {
    try {
      await deleteQualityChecker(id);
      return { id };
    } catch (err) {
      return rejectWithValue(err?.message || "Delete failed");
    }
  }
);

export const fetchStatesThunk = createAsyncThunk(
  "qualityChecker/fetchStates",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllStates();
      return normalizeList(data);
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to fetch states");
    }
  }
);

// kept for any legacy usage
export const fetchDistrictsThunk = createAsyncThunk(
  "qualityChecker/fetchDistricts",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllDistricts();
      return normalizeList(data);
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to fetch districts");
    }
  }
);

export const fetchLocationsThunk = createAsyncThunk(
  "qualityChecker/fetchLocations",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllLocations();
      return normalizeList(data);
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to fetch locations");
    }
  }
);

export const fetchDistrictsByStateThunk = createAsyncThunk(
  "qualityChecker/fetchDistrictsByState",
  async (stateId, { rejectWithValue }) => {
    try {
      const data = await getDistrictsByState(stateId);
      return normalizeList(data);
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to fetch districts");
    }
  }
);

export const fetchLocationsByStateThunk = createAsyncThunk(
  "qualityChecker/fetchLocationsByState",
  async (stateId, { rejectWithValue }) => {
    try {
      const data = await getLocationsByState(stateId);
      return normalizeList(data);
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to fetch locations");
    }
  }
);