import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://rootverse-backend-5qoo.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong"
  );
};

const cleanStatus = (status) => {
  return String(status || "").trim().toUpperCase();
};

export const cultureCycleService = {
  getAllCultureCycles: async () => {
    try {
      const response = await api.get("/api/aquaculture/culture-cycles");
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  updateVerificationStatus: async ({ id, newStatus, remarks }) => {
    try {
      const response = await api.put(
        `/api/aquaculture/culture-cycles/${id}/verification-status`,
        {
          newStatus: cleanStatus(newStatus),
          remarks: remarks || "Verified by reviewer",
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getPondStockingByCultureCycleId: async (culturecycle_id) => {
    try {
      const response = await api.get(
        `/api/aquaculture/pond-stocking/culturecycle/${culturecycle_id}`
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

export default cultureCycleService;