// src/redux/services/transportOperatorService.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://rootverse-backend-5qoo.onrender.com",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const transportOperatorService = {
  /** POST /api/admin/operators/transport */
  create: async (payload) => {
    const res = await api.post("/api/admin/operators/transport", payload);
    return res.data;
  },

  /** GET /api/admin/users?role=TRANSPORT_OPERATOR */
  getList: async ({ page = 1, page_size = 20, is_active } = {}) => {
    const params = { role: "TRANSPORT_OPERATOR", page, page_size };
    if (is_active !== undefined) params.is_active = is_active;
    const res = await api.get("/api/admin/users", { params });
    return res.data;
  },

  /**
   * PATCH /api/admin/operators/:operatorId/status
   * @param {string} operatorId  — operator_rv_id
   * @param {"active"|"inactive"|"suspended"} status
   */
  updateStatus: async (operatorId, status) => {
    const res = await api.patch(
      `/api/admin/operators/${operatorId}/status`,
      { status }
    );
    return res.data; // { success, data: { operator_rv_id, type, is_active } }
  },
};