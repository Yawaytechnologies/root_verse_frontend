import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAdminProcessors,
  fetchAdminProcessorById,
  updateAdminProcessorStatus,
} from "../action/adminProcessor.actions";
import { getProcessorStatusKey } from "../services/adminProcessor.service";

const initialState = {
  items: [],
  selectedProcessor: null,

  loading: false,
  detailLoading: false,
  statusUpdating: {},

  error: "",
  detailError: "",
  statusError: "",

  search: "",
  statusFilter: "all",
};

const adminProcessorSlice = createSlice({
  name: "adminProcessor",
  initialState,
  reducers: {
    setProcessorSearch(state, action) {
      state.search = action.payload;
    },

    setProcessorStatusFilter(state, action) {
      state.statusFilter = action.payload;
    },

    clearSelectedProcessor(state) {
      state.selectedProcessor = null;
      state.detailError = "";
    },

    clearProcessorStatusError(state) {
      state.statusError = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProcessors.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchAdminProcessors.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchAdminProcessors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch processors";
      })

      .addCase(fetchAdminProcessorById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = "";
        state.selectedProcessor = null;
      })
      .addCase(fetchAdminProcessorById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProcessor = action.payload;
      })
      .addCase(fetchAdminProcessorById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.payload || "Failed to fetch processor details";
      })

      .addCase(updateAdminProcessorStatus.pending, (state, action) => {
        const processorId = action.meta.arg.processorId;
        state.statusUpdating[processorId] = true;
        state.statusError = "";
      })
      .addCase(updateAdminProcessorStatus.fulfilled, (state, action) => {
        const { processorId, processor, status } = action.payload;

        delete state.statusUpdating[processorId];

        const finalStatus =
          String(status).toLowerCase() === "approved"
            ? "APPROVED"
            : "REJECTED";

        const fallbackProcessor = {
          id: processorId,
          status: finalStatus,
          approval_status: finalStatus,
          verification_status: finalStatus,
          is_active: finalStatus === "APPROVED",
        };

        const updatedProcessor = processor || fallbackProcessor;

        const index = state.items.findIndex(
          (item) => String(item.id) === String(processorId)
        );

        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...updatedProcessor,
          };
        }

        if (
          state.selectedProcessor &&
          String(state.selectedProcessor.id) === String(processorId)
        ) {
          state.selectedProcessor = {
            ...state.selectedProcessor,
            ...updatedProcessor,
          };
        }
      })
      .addCase(updateAdminProcessorStatus.rejected, (state, action) => {
        const processorId = action.meta.arg.processorId;
        delete state.statusUpdating[processorId];

        state.statusError =
          action.payload || "Failed to update processor status";
      });
  },
});

export const {
  setProcessorSearch,
  setProcessorStatusFilter,
  clearSelectedProcessor,
  clearProcessorStatusError,
} = adminProcessorSlice.actions;

export const selectAdminProcessorState = (state) => state.adminProcessor;

export const selectProcessorStats = (state) => {
  const processors = state.adminProcessor.items || [];

  return {
    total: processors.length,
    pending: processors.filter(
      (item) => getProcessorStatusKey(item) === "pending"
    ).length,
    approved: processors.filter(
      (item) => getProcessorStatusKey(item) === "approved"
    ).length,
    rejected: processors.filter(
      (item) => getProcessorStatusKey(item) === "rejected"
    ).length,
  };
};

export const selectFilteredProcessors = (state) => {
  const { items, search, statusFilter } = state.adminProcessor;
  const keyword = String(search || "").toLowerCase().trim();

  return (items || []).filter((processor) => {
    const district = processor.district || processor.operational_districts || "";
    const searchableText = [
      processor.processor_name,
      processor.company_name,
      processor.registration_no,
      processor.email,
      processor.mobile,
      district,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = !keyword || searchableText.includes(keyword);
    const matchesStatus =
      statusFilter === "all" || getProcessorStatusKey(processor) === statusFilter;

    return matchesSearch && matchesStatus;
  });
};

export default adminProcessorSlice.reducer;
