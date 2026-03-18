/**
 * pondActions.js
 * Redux async thunks for Pond operations.
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { pondService } from "../services/pondApprovalServices";

/* ─── Fetch all ponds ─── */
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

/* ─── Fetch single pond ─── */
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

/* ─── Approve a pond ─── */
export const approvePond = createAsyncThunk(
  "ponds/approve",
  async ({ id, pond }, { rejectWithValue }) => {
    try {
      return await pondService.approvePond(id, pond);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* ─── Reject a pond ─── */
export const rejectPond = createAsyncThunk(
  "ponds/reject",
  async ({ id, pond }, { rejectWithValue }) => {
    try {
      return await pondService.rejectPond(id, pond);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* ─── Generic update ─── */
export const updatePond = createAsyncThunk(
  "ponds/update",
  async ({ id, pondData }, { rejectWithValue }) => {
    try {
      return await pondService.updatePond(id, pondData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);