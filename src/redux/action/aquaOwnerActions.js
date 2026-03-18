/**
 * ownerActions.js
 * Redux async thunks for Owner approval operations.
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { ownerService } from "../services/aquaOwnerServices";

/** Fetch all aquaculture owners */
export const fetchAllOwners = createAsyncThunk(
  "ownerApproval/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await ownerService.getAllOwners();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Approve an owner → sends { verification_status: "VERIFIED" } */
export const approveOwner = createAsyncThunk(
  "ownerApproval/approve",
  async ({ id }, { rejectWithValue }) => {
    try {
      return await ownerService.approveOwner(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Reject an owner → sends { verification_status: "REJECTED" } */
export const rejectOwner = createAsyncThunk(
  "ownerApproval/reject",
  async ({ id }, { rejectWithValue }) => {
    try {
      return await ownerService.rejectOwner(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);