// src/redux/action/transportOperatorActions.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { transportOperatorService } from "../services/transportOperatorService";

/** POST /api/admin/operators/transport */
export const createTransportOperator = createAsyncThunk(
  "transportOperator/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await transportOperatorService.create(payload);
    } catch (err) {
      const status  = err.response?.status;
      const message = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to register operator";
      return rejectWithValue({ message, status });
    }
  }
);

/** GET /api/admin/users?role=TRANSPORT_OPERATOR */
export const fetchTransportOperators = createAsyncThunk(
  "transportOperator/fetchList",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await transportOperatorService.getList(params);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to load operators");
    }
  }
);

/**
 * PATCH /api/admin/operators/:operatorId/status
 * @param {{ operatorId: string, status: "active"|"inactive"|"suspended" }} arg
 */
export const updateTransportOperatorStatus = createAsyncThunk(
  "transportOperator/updateStatus",
  async ({ operatorId, status }, { rejectWithValue }) => {
    try {
      return await transportOperatorService.updateStatus(operatorId, status);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to update status");
    }
  }
);