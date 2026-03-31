const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://rootverse-backend-5qoo.onrender.com";

const request = async (endpoint, options = {}) => {
  const res  = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.message || data.error || "Request failed"), { status: res.status });
  return data;
};

/**
 * POST /api/admin/login
 * @param {{ login_id: string, password: string }} credentials
 * login_id can be email or phone number
 */
export const loginAdmin = (credentials) =>
  request("/api/admin/login", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(credentials),
  });

/**
 * POST /api/auth/refresh
 * @param {string} refreshToken
 * Returns { success, data: { access_token, token_type } }
 */
export const refreshTokenApi = (refreshToken) =>
  request("/api/auth/refresh", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ refresh_token: refreshToken }),
  });

/**
 * GET /api/admin/me
 * @param {string} accessToken
 */
export const fetchAdminProfile = (accessToken) =>
  request("/api/admin/me", {
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
  });
