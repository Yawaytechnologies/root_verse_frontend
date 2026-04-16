// crateListingAction.js — Async thunk actions for crate listing

import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchCratesApi,
  fetchCrateByIdApi,
  overrideCrateStatusApi,
} from "../services/crateListingServices";

/**
 * Fetch paginated/filtered crate list
 * Dispatched on page load, filter change, or pagination
 */
export const fetchCratesAction = createAsyncThunk(
  "crateListing/fetchCrates",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchCratesApi(params);
      return response; // { success: true, data: [...] }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch crates");
    }
  }
);

/**
 * Fetch single crate detail (for View modal)
 * Includes status_history, dispatch_assignment, temperature_logs
 */
export const fetchCrateDetailAction = createAsyncThunk(
  "crateListing/fetchCrateDetail",
  async (crateId, { rejectWithValue }) => {
    try {
      const response = await fetchCrateByIdApi(crateId);
      return response; // { success: true, data: { ...crate } }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch crate detail");
    }
  }
);

/**
 * Override crate status (admin action from Edit/Override modal)
 * Requires: new_status, reason_code, reason_text, admin_id
 */
export const overrideCrateStatusAction = createAsyncThunk(
  "crateListing/overrideCrateStatus",
  async ({ crateId, payload }, { rejectWithValue }) => {
    try {
      const response = await overrideCrateStatusApi(crateId, payload);
      return response; // { success: true, data: { ...updated crate } }
    } catch (error) {
      return rejectWithValue(error.message || "Failed to override crate status");
    }
  }
);