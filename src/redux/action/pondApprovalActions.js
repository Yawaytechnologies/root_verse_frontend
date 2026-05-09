import { createAsyncThunk } from "@reduxjs/toolkit";
import { pondService } from "../services/pondApprovalServices";

export const fetchAllPonds = createAsyncThunk(
  "ponds/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await pondService.getAllPonds(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchPondById = createAsyncThunk(
  "ponds/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await pondService.getPondById(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const approvePond = createAsyncThunk(
  "ponds/approve",
  async ({ id }, { rejectWithValue }) => {
    try {
      return await pondService.approvePond(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const rejectPond = createAsyncThunk(
  "ponds/reject",
  async ({ id }, { rejectWithValue }) => {
    try {
      return await pondService.rejectPond(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updatePond = createAsyncThunk(
  "ponds/update",
  async ({ id, pond, overrides = {} }, { rejectWithValue }) => {
    try {
      const keys = Object.keys(overrides);

      if (keys.length === 1 && overrides.pond_status !== undefined) {
        return await pondService.setActive(
          id,
          overrides.pond_status === "Active"
        );
      }

      if (keys.length === 1 && overrides.verification_status !== undefined) {
        return await pondService.updatePondVerificationStatus(
          id,
          overrides.verification_status
        );
      }

      return await pondService.updatePond(id, pond, overrides);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);