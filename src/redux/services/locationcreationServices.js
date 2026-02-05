import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL || "https://rootverse-backend-5qoo.onrender.com",
  headers: { "Content-Type": "application/json" },
});

// IMPORTANT: backend may return array OR {data:[]} OR {districts:[]}
// we normalize in slice, not here.

export const geoService = {
  // STATES
  getStates: async () => {
    const res = await api.get("/api/states");
    return res.data;
  },
  createState: async (payload) => {
    const res = await api.post("/api/states", payload);
    return res.data;
  },

  // DISTRICTS
  // Backend supports: /api/districts?state_id=4  (as seen in your Network tab)
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
