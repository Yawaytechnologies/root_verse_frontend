// src/redux/action/dashboardActions.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchOwnersWildCapture,
  fetchAllVessels,
  fetchAllTrips,
} from "../services/dashboardServices";

export const fetchWildCaptureDashboard = createAsyncThunk(
  "dashboard/fetchWildCaptureDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const [ownersRes, vesselsRes, tripsRes] = await Promise.all([
        fetchOwnersWildCapture(),
        fetchAllVessels(),
        fetchAllTrips(),
      ]);

      const ownersTotal =
        Number(ownersRes?.total) ||
        (Array.isArray(ownersRes?.users) ? ownersRes.users.length : 0);

      const vessels = Array.isArray(vesselsRes) ? vesselsRes : vesselsRes?.data || [];
      const trips = Array.isArray(tripsRes) ? tripsRes : tripsRes?.data || [];

      const tripsTotal = trips.length;
      const pendingTrips = trips.filter((t) => String(t?.approval_status).toLowerCase() === "pending").length;

      return {
        ownersTotal,
        vesselsTotal: vessels.length,
        tripsTotal,
        pendingTrips,
        trips,
        ownersProgress: ownersRes?.progress || null,
      };
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to load dashboard");
    }
  }
);
