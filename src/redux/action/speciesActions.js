import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllFishTypes,
  createFishType,
  updateFishType,
  deleteFishType,
} from "../services/speciesServices";

export const fetchSpecies = createAsyncThunk(
  "species/fetchSpecies",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllFishTypes();
      return Array.isArray(data) ? data : data?.data || data?.fish || [];
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to fetch species");
    }
  }
);

export const addSpecies = createAsyncThunk(
  "species/addSpecies",
  async ({ fish_name, fish_code }, { rejectWithValue }) => {
    try {
      const data = await createFishType({ fish_name, fish_code });
      return data;
    } catch (err) {
      return rejectWithValue(err?.message || "Create failed");
    }
  }
);

export const editSpecies = createAsyncThunk(
  "species/editSpecies",
  async ({ id, fish_name, fish_code }, { rejectWithValue }) => {
    try {
      const data = await updateFishType(id, { fish_name, fish_code });
      return { id, data, fish_name, fish_code };
    } catch (err) {
      return rejectWithValue(err?.message || "Update failed");
    }
  }
);

export const removeSpecies = createAsyncThunk(
  "species/removeSpecies",
  async ({ id }, { rejectWithValue }) => {
    try {
      await deleteFishType(id);
      return { id };
    } catch (err) {
      return rejectWithValue(err?.message || "Delete failed");
    }
  }
);
