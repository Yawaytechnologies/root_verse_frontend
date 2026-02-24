import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://rootverse-backend-5qoo.onrender.com",
  headers: { "Content-Type": "application/json" },
});

// NOTE: normalize in slice, not here.

export const geoService = {
  // COUNTRIES  ✅ (your backend: /api/country)
  getCountries: async () => {
    const res = await api.get("/api/country");
    return res.data;
  },
  createCountry: async (payload) => {
    const res = await api.post("/api/country", payload);
    return res.data;
  },

  // STATES
  getStates: async ({ countryId } = {}) => {
    const res = await api.get("/api/states", {
      params: countryId ? { country_id: countryId } : {},
    });
    return res.data;
  },
  createState: async (payload) => {
    const res = await api.post("/api/states", payload);
    return res.data;
  },

  // DISTRICTS
  getDistricts: async ({ stateId } = {}) => {
    const res = await api.get("/api/districts", {
      params: stateId ? { state_id: stateId } : {},
    });
    return res.data;
  },
  createDistrict: async (payload) => {
    const res = await api.post("/api/districts", payload);
    return res.data;
  },

  // LOCATIONS (Ports)
  getLocations: async ({ stateId, districtId } = {}) => {
    const res = await api.get("/api/locations", {
      params: {
        ...(stateId ? { state_id: stateId } : {}),
        ...(districtId ? { district_id: districtId } : {}),
      },
    });
    return res.data;
  },
  createLocation: async (payload) => {
    const res = await api.post("/api/locations", payload);
    return res.data;
  },
};