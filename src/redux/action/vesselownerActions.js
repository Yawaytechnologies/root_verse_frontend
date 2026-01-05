// src/redux/action/ownerActions.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchOwnersWildCapture,
  verifyOwnerKyc,
} from "../services/vesselownerServices";

export const getWildCaptureOwners = createAsyncThunk(
  "owner/getWildCaptureOwners",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchOwnersWildCapture();
      return data?.users || [];
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to fetch owners");
    }
  }
);

export const updateOwnerVerification = createAsyncThunk(
  "owner/updateOwnerVerification",
  async ({ ownerId, payload }, { rejectWithValue }) => {
    try {
      const fd = new FormData();

      // ✅ backend expects aadhar_number
      fd.append("aadhar_number", payload.aadhar_number || "");
      fd.append("pan_number", payload.pan_number || "");
      fd.append("govt_id", payload.govt_id || "");

      // ✅ files (optional)
      if (payload.aadhar) fd.append("aadhar", payload.aadhar);
      if (payload.pan) fd.append("pan", payload.pan);
      if (payload.govt) fd.append("govt", payload.govt);

      const data = await verifyOwnerKyc({ ownerId, formData: fd });
      return { ownerId, data };
    } catch (err) {
      return rejectWithValue(err?.message || "Update failed");
    }
  }
);
