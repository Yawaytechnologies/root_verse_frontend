import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAllFilledQrInspections } from "../../redux/services/qcInspectionServices";

export const getAllQcInspections = createAsyncThunk(
  "qcInspection/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAllFilledQrInspections({ chunkSize: 200 });

      return {
        items: data.items,
        total: data.total,
        pagesFetched: data.pagesFetched,
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.detail ||
          error?.message ||
          "Failed to fetch QC inspections"
      );
    }
  }
);