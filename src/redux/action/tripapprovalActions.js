// src/redux/action/tripapprovalActions.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchTripsByStatusApi,
  approveTripApi,
  fetchTripDetailsApi,
  fetchCatchlogsForTripApi,
} from "../services/tripapprovalServices";

export const fetchTripsByStatus = createAsyncThunk(
  "tripApproval/fetchTripsByStatus",
  async ({ status }, { rejectWithValue }) => {
    try {
      const data = await fetchTripsByStatusApi(status);

      // tolerate different API shapes
      if (Array.isArray(data)) return { status, trips: data };
      if (Array.isArray(data?.trips)) return { status, trips: data.trips };
      if (Array.isArray(data?.data)) return { status, trips: data.data };

      return { status, trips: [] };
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to fetch trips");
    }
  }
);

export const approveTrip = createAsyncThunk(
  "tripApproval/approveTrip",
  async ({ id }, { rejectWithValue }) => {
    try {
      const data = await approveTripApi(id);
      return { id, data };
    } catch (err) {
      return rejectWithValue(err?.message || "Approve failed");
    }
  }
);

export const fetchTripDetails = createAsyncThunk(
  "tripApproval/fetchTripDetails",
  async ({ id }, { rejectWithValue }) => {
    try {
      const data = await fetchTripDetailsApi(id);
      // if backend returns {trip: {...}}
      return data?.trip ? { id, trip: data.trip } : { id, trip: data };
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to fetch trip details");
    }
  }
);

export const fetchCatchlogsForTrip = createAsyncThunk(
  "tripApproval/fetchCatchlogsForTrip",
  async ({ tripId, qcStatus = "all" }, { rejectWithValue }) => {
    try {
      const data = await fetchCatchlogsForTripApi(tripId, qcStatus);

      // tolerate shapes
      const rows = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : data?.catchlogs || [];
      return { tripId, qcStatus, rows };
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to fetch catch logs");
    }
  }
);
