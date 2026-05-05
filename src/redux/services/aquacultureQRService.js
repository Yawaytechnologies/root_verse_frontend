// src/store/services/aquacultureQrService.js
import axios from "axios";

const BASE_URL = "https://rootverse-backend-5qoo.onrender.com";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach auth token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const aquacultureQrService = {
  /**
   * POST /api/aquaculture/qrs/generate
   * Generate aquaculture QR codes in batch
   * @param {{ location_id: number, type: string, year: number, qrs: number }} payload
   */
  generateQRs: async (payload) => {
    const response = await api.post("/api/aquaculture/qrs/generate", payload);
    return response.data;
  },

  /**
   * GET /api/aquaculture/qrs/code/{code}
   * Get aquaculture QR by code
   * @param {string} code
   */
  getQRByCode: async (code) => {
    const response = await api.get(`/api/aquaculture/qrs/code/${code}`);
    return response.data;
  },

  /**
   * GET /api/aquaculture/qrs/{id}
   * Get aquaculture QR by ID
   * @param {number} id
   */
  getQRById: async (id) => {
    const response = await api.get(`/api/aquaculture/qrs/${id}`);
    return response.data;
  },
};

export default aquacultureQrService;