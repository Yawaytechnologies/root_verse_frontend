// src/redux/action/tripActions.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAllTrips, approveTripApi } from "../services/tripapprovalServices";

export const getTrips = createAsyncThunk(
  "trip/getTrips",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAllTrips();
      // API returns array
      return Array.isArray(data) ? data : data?.trips || [];
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to fetch trips");
    }
  }
);

export const approveTrip = createAsyncThunk(
  "trip/approveTrip",
  async ({ id }, { rejectWithValue }) => {
    try {
      const data = await approveTripApi(id);
      return { id, data };
    } catch (err) {
      return rejectWithValue(err?.message || "Approve failed");
    }
  }
);
