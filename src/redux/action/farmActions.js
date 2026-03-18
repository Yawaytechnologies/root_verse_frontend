/**
 * farmActions.js
 * Redux async thunks for Farm operations.
 * Uses createAsyncThunk from @reduxjs/toolkit.
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { farmService } from "../services/farmapprovalServices";

/* ─── Fetch all farms ─── */
/**
 * Fetches the full farm list.
 * @param {Object} params  optional query params e.g. { status: "pending" }
 */
export const fetchAllFarms = createAsyncThunk(
  "farms/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await farmService.getAllFarms(params);
      return data; // expects array of farm objects
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* ─── Fetch single farm ─── */
export const fetchFarmById = createAsyncThunk(
  "farms/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await farmService.getFarmById(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* ─── Approve a farm ─── */
/**
 * Calls PUT /api/farms/:id with status: "approved".
 * @param {{ id: number, farm: Object }}
 *   id   – farm primary key
 *   farm – current full farm object from state (needed to populate PUT body)
 */
export const approveFarm = createAsyncThunk(
  "farms/approve",
  async ({ id, farm }, { rejectWithValue }) => {
    try {
      return await farmService.approveFarm(id, farm);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* ─── Reject a farm ─── */
export const rejectFarm = createAsyncThunk(
  "farms/reject",
  async ({ id, farm }, { rejectWithValue }) => {
    try {
      return await farmService.rejectFarm(id, farm);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* ─── Update farm (generic) ─── */
/**
 * General-purpose update. Pass the full updated farm object.
 * @param {{ id: number, farmData: Object }}
 */
export const updateFarm = createAsyncThunk(
  "farms/update",
  async ({ id, farmData }, { rejectWithValue }) => {
    try {
      return await farmService.updateFarm(id, farmData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);