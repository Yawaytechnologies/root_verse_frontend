// src/redux/actions/fishingMethodActions.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import fishingMethodService from "../services/fishingMethodServices";

function errMsg(err) {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Something went wrong"
  );
}

export const fetchFishingMethodsThunk = createAsyncThunk(
  "fishingMethods/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await fishingMethodService.getAll();
    } catch (err) {
      return rejectWithValue(errMsg(err));
    }
  }
);

export const createFishingMethodThunk = createAsyncThunk(
  "fishingMethods/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await fishingMethodService.create(payload);
    } catch (err) {
      return rejectWithValue(errMsg(err));
    }
  }
);

export const updateFishingMethodThunk = createAsyncThunk(
  "fishingMethods/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await fishingMethodService.update(id, payload);
    } catch (err) {
      return rejectWithValue(errMsg(err));
    }
  }
);

export const deleteFishingMethodThunk = createAsyncThunk(
  "fishingMethods/delete",
  async (id, { rejectWithValue }) => {
    try {
      await fishingMethodService.remove(id);
      return id; // return deleted id
    } catch (err) {
      return rejectWithValue(errMsg(err));
    }
  }
);
