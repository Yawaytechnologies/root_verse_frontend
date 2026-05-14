import { createAsyncThunk } from "@reduxjs/toolkit";
import { cultureCycleService } from "../services/cultureCycleServices";

export const fetchAllCultureCycles = createAsyncThunk(
  "cultureCycleApproval/fetchAllCultureCycles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cultureCycleService.getAllCultureCycles();
      return response?.data || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCultureCycleVerificationStatus = createAsyncThunk(
  "cultureCycleApproval/updateVerificationStatus",
  async ({ id, newStatus, remarks }, { rejectWithValue }) => {
    try {
      const response = await cultureCycleService.updateVerificationStatus({
        id,
        newStatus,
        remarks,
      });

      return {
        id,
        newStatus,
        data: response?.data || null,
        message: response?.message || "Culture cycle status updated",
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPondStockingByCultureCycleId = createAsyncThunk(
  "cultureCycleApproval/fetchPondStockingByCultureCycleId",
  async (culturecycle_id, { rejectWithValue }) => {
    try {
      const response =
        await cultureCycleService.getPondStockingByCultureCycleId(
          culturecycle_id
        );

      return {
        culturecycle_id,
        data: response?.data ?? response,
        message: response?.message || "Pond stocking fetched successfully",
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);