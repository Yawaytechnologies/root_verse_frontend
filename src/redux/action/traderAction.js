// src/redux/action/traderAction.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getTraderOrganizationsService,
  updateTraderStatusService,
  createTraderOrganizationService,
} from "../services/traderServices";

export const fetchTraderOrganizations = createAsyncThunk(
  "trader/fetchTraderOrganizations",
  async (_, { rejectWithValue }) => {
    try {
      return await getTraderOrganizationsService();
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to fetch traders");
    }
  }
);

export const changeTraderStatus = createAsyncThunk(
  "trader/changeTraderStatus",
  async ({ traderId, status, is_active }, { rejectWithValue }) => {
    try {
      return await updateTraderStatusService(traderId, {
        status,
        is_active,
      });
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to update trader status"
      );
    }
  }
);

export const createTraderOrganization = createAsyncThunk(
  "trader/createTraderOrganization",
  async (payload, { rejectWithValue }) => {
    try {
      return await createTraderOrganizationService(payload);
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to create trader");
    }
  }
);