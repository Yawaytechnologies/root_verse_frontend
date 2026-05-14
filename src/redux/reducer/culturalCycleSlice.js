import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAllCultureCycles,
  updateCultureCycleVerificationStatus,
  fetchPondStockingByCultureCycleId,
} from "../action/cultureCycleAction";

const initialState = {
  cultureCycles: [],
  selectedCultureCycle: null,

  pondStocking: [],
  pondStockingCultureCycleId: null,
  pondStockingLoading: false,
  pondStockingError: null,

  loading: false,
  updating: false,
  updatingId: null,
  error: null,
  successMessage: null,
};

const normalizePondStocking = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return [payload];
};

const culturalCycleSlice = createSlice({
  name: "cultureCycleApproval",
  initialState,
  reducers: {
    setSelectedCultureCycle: (state, action) => {
      state.selectedCultureCycle = action.payload;
    },

    clearSelectedCultureCycle: (state) => {
      state.selectedCultureCycle = null;
    },

    clearCultureCycleMessages: (state) => {
      state.error = null;
      state.successMessage = null;
      state.pondStockingError = null;
    },

    clearPondStocking: (state) => {
      state.pondStocking = [];
      state.pondStockingCultureCycleId = null;
      state.pondStockingError = null;
      state.pondStockingLoading = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCultureCycles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAllCultureCycles.fulfilled, (state, action) => {
        state.loading = false;
        state.cultureCycles = action.payload || [];
      })

      .addCase(fetchAllCultureCycles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch culture cycles";
      })

      .addCase(updateCultureCycleVerificationStatus.pending, (state, action) => {
        state.updating = true;
        state.updatingId = action.meta.arg.id;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(updateCultureCycleVerificationStatus.fulfilled, (state, action) => {
        state.updating = false;
        state.updatingId = null;
        state.successMessage = action.payload.message;

        const { id, newStatus, data } = action.payload;

        const finalStatus =
          data?.verification_status ||
          data?.newStatus ||
          data?.status ||
          newStatus;

        const index = state.cultureCycles.findIndex(
          (cycle) => Number(cycle.id) === Number(id)
        );

        if (index !== -1) {
          state.cultureCycles[index] = {
            ...state.cultureCycles[index],
            ...(data || {}),
            verification_status: finalStatus,
          };
        }

        if (
          state.selectedCultureCycle &&
          Number(state.selectedCultureCycle.id) === Number(id)
        ) {
          state.selectedCultureCycle = {
            ...state.selectedCultureCycle,
            ...(data || {}),
            verification_status: finalStatus,
          };
        }
      })

      .addCase(updateCultureCycleVerificationStatus.rejected, (state, action) => {
        state.updating = false;
        state.updatingId = null;
        state.error = action.payload || "Failed to update culture cycle status";
      })

      .addCase(fetchPondStockingByCultureCycleId.pending, (state, action) => {
        state.pondStockingLoading = true;
        state.pondStockingError = null;
        state.pondStockingCultureCycleId = action.meta.arg;
        state.pondStocking = [];
      })

      .addCase(fetchPondStockingByCultureCycleId.fulfilled, (state, action) => {
        state.pondStockingLoading = false;
        state.pondStockingCultureCycleId = action.payload.culturecycle_id;
        state.pondStocking = normalizePondStocking(action.payload.data);
      })

      .addCase(fetchPondStockingByCultureCycleId.rejected, (state, action) => {
        state.pondStockingLoading = false;
        state.pondStocking = [];
        state.pondStockingError =
          action.payload || "Failed to fetch pond stocking";
      });
  },
});

export const {
  setSelectedCultureCycle,
  clearSelectedCultureCycle,
  clearCultureCycleMessages,
  clearPondStocking,
} = culturalCycleSlice.actions;

export default culturalCycleSlice.reducer;