import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllFishTypes,
  createFishType,
  updateFishType,
  deleteFishType,
} from "../services/speciesServices";

// ✅ GET
export const fetchSpecies = createAsyncThunk(
  "species/fetchSpecies",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllFishTypes();
      // supports: [..] OR {data:[..]} OR {fish:[..]}
      return Array.isArray(data) ? data : data?.data || data?.fish || [];
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to fetch species");
    }
  }
);

// ✅ CREATE (IMPORTANT: do NOT destructure and drop fish_type_image)
export const addSpecies = createAsyncThunk(
  "species/addSpecies",
  async (payload, { rejectWithValue }) => {
    try {
      // payload can be: { fish_name, fish_code, fish_type_image: File }
      const data = await createFishType(payload);
      return data;
    } catch (err) {
      return rejectWithValue(err?.message || "Create failed");
    }
  }
);

// ✅ UPDATE (IMPORTANT: pass fish_type_image if present, but don't return it)
export const editSpecies = createAsyncThunk(
  "species/editSpecies",
  async (payload, { rejectWithValue }) => {
    try {
      const { id, fish_name, fish_code, fish_type_image } = payload || {};
      if (!id) throw new Error("Missing id");

      const updatePayload = { fish_name, fish_code };
      if (fish_type_image instanceof File) updatePayload.fish_type_image = fish_type_image;

      const data = await updateFishType(id, updatePayload);

      // ✅ do NOT include fish_type_image in returned action payload (avoid serializable issues)
      return { id, data, fish_name, fish_code };
    } catch (err) {
      return rejectWithValue(err?.message || "Update failed");
    }
  }
);

// ✅ DELETE
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
