import { createAsyncThunk } from "@reduxjs/toolkit";
import { collectionCenterService } from "../services/collectionCenterService";

/**
 * GET /api/states
 * Fetches all available states for the dropdown
 */
export const fetchStates = createAsyncThunk(
  "collectionCenter/fetchStates",
  async (_, { rejectWithValue }) => {
    try {
      return await collectionCenterService.getStates();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to load states");
    }
  }
);

/**
 * GET /api/districts?state=<state>
 * Fetches districts for a given state
 * @param {string} state - selected state value
 */
export const fetchDistricts = createAsyncThunk(
  "collectionCenter/fetchDistricts",
  async (state, { rejectWithValue }) => {
    try {
      return await collectionCenterService.getDistricts(state);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to load districts");
    }
  }
);

/**
 * GET /api/admin/collection-centres?page=&page_size=
 * @param {{ page?: number, page_size?: number }} params
 */
export const fetchCollectionCenters = createAsyncThunk(
  "collectionCenter/fetchList",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await collectionCenterService.getList(params);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to load centres");
    }
  }
);

/**
 * GET /api/admin/collection-centres/:centreId
 */
export const fetchCenterDetail = createAsyncThunk(
  "collectionCenter/fetchDetail",
  async (centreId, { rejectWithValue }) => {
    try {
      return await collectionCenterService.getDetail(centreId);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to load centre detail");
    }
  }
);

/**
 * PATCH /api/admin/collection-centres/:centreId
 * @param {{ centreId: string, payload: Object }} arg
 */
export const updateCollectionCenter = createAsyncThunk(
  "collectionCenter/update",
  async ({ centreId, payload }, { rejectWithValue }) => {
    try {
      return await collectionCenterService.updateCenter(centreId, payload);
    } catch (err) {
      const status  = err.response?.status;
      const message = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to update centre";
      return rejectWithValue({ message, status });
    }
  }
);

/**
 * POST /api/admin/collection-centres
 * Submits the collection centre creation form
 * @param {Object} payload - centre form data
 */
export const createCollectionCenter = createAsyncThunk(
  "collectionCenter/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await collectionCenterService.createCollectionCenter(payload);
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to create collection centre";
      const error = new Error(message);
      error.status = status;
      return rejectWithValue({ message, status });
    }
  }
);
