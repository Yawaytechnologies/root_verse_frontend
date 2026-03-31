import { createSlice } from "@reduxjs/toolkit";
import {
  loginAdminThunk,
  refreshTokenThunk,
  fetchAdminProfileThunk,
  clearSession,
} from "../action/adminLoginActions";

const initialState = {
  admin:           null,   // { id, username, email, phone, ... }
  role:            null,   // "ADMIN"
  accessToken:     null,
  refreshToken:    null,
  loading:         false,
  error:           null,
  isAuthenticated: false,
};

const setLoading = (state)         => { state.loading = true;  state.error = null; };
const setError   = (state, action) => { state.loading = false; state.error = action.payload; };

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    /** Logout — clears localStorage and resets slice */
    logout(state) {
      clearSession();
      Object.assign(state, initialState);
    },

    clearError(state) { state.error = null; },

    /**
     * Rehydrate Redux state from localStorage on app boot.
     * Call this only after confirming isSessionValid() === true.
     */
    initFromStorage(state) {
      const token   = localStorage.getItem("access_token");
      const refresh = localStorage.getItem("refresh_token");
      if (token && refresh) {
        state.accessToken     = token;
        state.refreshToken    = refresh;
        state.isAuthenticated = true;
      }
    },
  },

  extraReducers: (builder) => {
    // ── Login ──────────────────────────────────────────────────────────────
    builder
      .addCase(loginAdminThunk.pending, setLoading)
      .addCase(loginAdminThunk.fulfilled, (state, action) => {
        const { access_token, refresh_token, role, user } = action.payload;
        state.loading         = false;
        state.accessToken     = access_token;
        state.refreshToken    = refresh_token;
        state.role            = role ?? null;
        // user object from login response: { id, full_name, email }
        if (user) state.admin = user;
        state.isAuthenticated = true;
        state.error           = null;
      })
      .addCase(loginAdminThunk.rejected, setError);

    // ── Token refresh — only access_token changes ──────────────────────────
    builder
      .addCase(refreshTokenThunk.pending, setLoading)
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.loading     = false;
        state.accessToken = action.payload.access_token;
      })
      .addCase(refreshTokenThunk.rejected, (state, action) => {
        // Refresh failed → force full logout
        clearSession();
        Object.assign(state, initialState);
        state.error = action.payload;
      });

    // ── Admin profile — GET /api/admin/me ──────────────────────────────────
    builder
      .addCase(fetchAdminProfileThunk.pending, setLoading)
      .addCase(fetchAdminProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Response: { id, username, email, phone, address, date_of_birth, ... }
        state.admin   = action.payload;
      })
      .addCase(fetchAdminProfileThunk.rejected, setError);
  },
});

export const { logout, clearError, initFromStorage } = authSlice.actions;
export default authSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectAdmin           = (state) => state.auth.admin;
export const selectRole            = (state) => state.auth.role;
export const selectAccessToken     = (state) => state.auth.accessToken;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading     = (state) => state.auth.loading;
export const selectAuthError       = (state) => state.auth.error;
