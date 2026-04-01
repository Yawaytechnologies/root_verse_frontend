import { createAsyncThunk } from "@reduxjs/toolkit";
import { collectionCentreOperatorService } from "../services/collectionCentreOperatorService";

/**
 * POST /api/admin/operators/collection-centre
 */
export const createCCOperator = createAsyncThunk(
  "ccOperator/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await collectionCentreOperatorService.create(payload);
    } catch (err) {
      const status  = err.response?.status;
      const message = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to register operator";
      return rejectWithValue({ message, status });
    }
  }
);

/**
 * GET /api/admin/users
 * Pass role: "COLLECTION_CENTRE_OPERATOR" | "TRANSPORT_OPERATOR" to filter by role.
 * Omit role to list admins.
 */
export const fetchCCOperators = createAsyncThunk(
  "ccOperator/fetchList",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await collectionCentreOperatorService.getList(params);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to load operators");
    }
  }
);