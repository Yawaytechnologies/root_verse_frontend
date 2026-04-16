// crateListingApi.js — Crate API service layer

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://rootverse-backend-5qoo.onrender.com";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    const message = data?.error || data?.message || "Something went wrong";
    throw new Error(message);
  }
  return data;
};

/**
 * GET /api/admin/crates
 * Fetch paginated crate list with optional filters
 * @param {Object} params - { status, date, centre_id, transport_operator_id, destination_name, page, page_size }
 */
export const fetchCratesApi = async (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      query.append(key, val);
    }
  });

  const res = await fetch(`${BASE_URL}/api/admin/crates?${query.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

/**
 * GET /api/admin/crates/:crateId
 * Fetch single crate detail including status_history, dispatch_assignment, temperature_logs
 * @param {number} crateId - DB integer id
 */
export const fetchCrateByIdApi = async (crateId) => {
  const res = await fetch(`${BASE_URL}/api/admin/crates/${crateId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

/**
 * PATCH /api/admin/crates/:crateId/status
 * Override crate status (admin action)
 * @param {number} crateId
 * @param {Object} payload - { new_status, reason_code, reason_text, admin_id }
 */
export const overrideCrateStatusApi = async (crateId, payload) => {
  const res = await fetch(`${BASE_URL}/api/admin/crates/${crateId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};