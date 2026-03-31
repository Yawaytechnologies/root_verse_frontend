import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginAdmin, refreshTokenApi, fetchAdminProfile } from "../services/adminLoginService";

// refresh_token expires in 7 days per API spec
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Save tokens to localStorage after login */
function saveSession(accessToken, refreshToken) {
  localStorage.setItem("access_token",   accessToken);
  localStorage.setItem("refresh_token",  refreshToken);
  localStorage.setItem("refresh_token_issued_at", String(Date.now()));
}

/**
 * Returns true if refresh_token is still within its 7-day TTL.
 * access_token lasts 30 days but is gated by the refresh_token.
 */
export function isSessionValid() {
  const token    = localStorage.getItem("access_token");
  const issuedAt = parseInt(localStorage.getItem("refresh_token_issued_at") || "0", 10);
  return !!token && (Date.now() - issuedAt) < REFRESH_TOKEN_TTL_MS;
}

/** Wipe all auth data from localStorage */
export function clearSession() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("refresh_token_issued_at");
}

/**
 * POST /api/admin/login
 * Payload: { login_id, password }
 * login_id accepts email or phone number
 */
export const loginAdminThunk = createAsyncThunk(
  "auth/login",
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const data = await loginAdmin(credentials);
      // API returns snake_case: access_token, refresh_token
      saveSession(data.access_token, data.refresh_token);
      dispatch(fetchAdminProfileThunk(data.access_token));
      return data; // { access_token, refresh_token, token_type, role, user }
    } catch (err) {
      return rejectWithValue(err.message || "Login failed");
    }
  }
);

/**
 * POST /api/auth/refresh
 * Only returns a new access_token — refresh_token stays the same
 */
export const refreshTokenThunk = createAsyncThunk(
  "auth/refresh",
  async (_, { getState, rejectWithValue }) => {
    try {
      const storedRefresh =
        getState().auth.refreshToken ?? localStorage.getItem("refresh_token");
      const data = await refreshTokenApi(storedRefresh);
      // Response: { success, data: { access_token, token_type } }
      const newAccessToken = data.data?.access_token ?? data.access_token;
      localStorage.setItem("access_token", newAccessToken);
      return { access_token: newAccessToken };
    } catch (err) {
      return rejectWithValue(err.message || "Token refresh failed");
    }
  }
);

/**
 * GET /api/admin/me
 */
export const fetchAdminProfileThunk = createAsyncThunk(
  "auth/fetchProfile",
  async (accessToken, { getState, rejectWithValue }) => {
    try {
      const token =
        accessToken ??
        getState().auth.accessToken ??
        localStorage.getItem("access_token");
      return await fetchAdminProfile(token);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load profile");
    }
  }
);
