// src/redux/action/cratepackerCreateActions.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createCratePackerApi,
  fetchCratePackersApi,
  fetchLocationsApi,
  updateCratePackerApi,
  deleteCratePackerApi,
} from "../../redux/services/cratepackerCreateServices";

const errMsg = (err) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  "Request failed";

export const fetchCratePackers = createAsyncThunk(
  "cratePacker/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchCratePackersApi();
    } catch (err) {
      return rejectWithValue(errMsg(err));
    }
  }
);

export const createCratePacker = createAsyncThunk(
  "cratePacker/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await createCratePackerApi(payload);
    } catch (err) {
      return rejectWithValue(errMsg(err));
    }
  }
);

export const fetchLocations = createAsyncThunk(
  "cratePacker/fetchLocations",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchLocationsApi();
    } catch (err) {
      return rejectWithValue(errMsg(err));
    }
  }
);

export const updateCratePacker = createAsyncThunk(
  "cratePacker/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await updateCratePackerApi(id, payload);
    } catch (err) {
      return rejectWithValue(errMsg(err));
    }
  }
);

export const deleteCratePacker = createAsyncThunk(
  "cratePacker/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteCratePackerApi(id);
      return { id };
    } catch (err) {
      return rejectWithValue(errMsg(err));
    }
  }
);