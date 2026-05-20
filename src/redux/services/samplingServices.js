import axios from "axios";

const RAW_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://rootverse-backend-5qoo.onrender.com";

const BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");
const API_ROOT = BASE_URL.endsWith("/api") ? BASE_URL : `${BASE_URL}/api`;

const SAMPLING_API = `${API_ROOT}/aquaculture/sampling`;

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    ""
  );
};

const getHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong"
  );
};

export const samplingService = {
  getAllSampling: async () => {
    try {
      const response = await axios.get(SAMPLING_API, {
        headers: getHeaders(),
      });

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

export default samplingService;