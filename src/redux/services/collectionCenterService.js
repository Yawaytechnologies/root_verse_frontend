import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://rootverse-backend-5qoo.onrender.com",
  headers: { "Content-Type": "application/json" },
});

// Attach auth token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const collectionCenterService = {
  /**
   * GET /api/states
   * Returns list of states
   */
  getStates: async () => {
    const res = await api.get("/api/states");
    return res.data;
  },

  /**
   * GET /api/districts?state=<stateName>
   * Returns districts filtered by state name/value
   * @param {string} state - the selected state value
   */
  getDistricts: async (state) => {
    const res = await api.get("/api/districts", {
      params: { state },
    });
    return res.data;
  },

  /**
   * POST /api/admin/collection-centres
   * Creates a new collection centre
   */
  createCollectionCenter: async (payload) => {
    const res = await api.post("/api/admin/collection-centres", payload);
    return res.data;
  },

  /**
   * GET /api/admin/collection-centres?page=1&page_size=20
   */
  getList: async ({ page = 1, page_size = 20 } = {}) => {
    const res = await api.get("/api/admin/collection-centres", {
      params: { page, page_size },
    });
    return res.data;
  },

  /**
   * GET /api/admin/collection-centres/:centreId
   */
  getDetail: async (centreId) => {
    const res = await api.get(`/api/admin/collection-centres/${centreId}`);
    return res.data;
  },

  /**
   * PATCH /api/admin/collection-centres/:centreId
   * Send only the fields to update
   */
  updateCenter: async (centreId, payload) => {
    const res = await api.patch(`/api/admin/collection-centres/${centreId}`, payload);
    return res.data;
  },
};
