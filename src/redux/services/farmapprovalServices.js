/**
 * farmService.js
 * Pure API layer for Farm endpoints.
 * Base URL: https://rootverse-backend-5qoo.onrender.com
 *
 * Endpoints used:
 *   GET  /api/farms          – list all farms (optional query params)
 *   GET  /api/farms/:id      – get single farm
 *   PUT  /api/farms/:id      – update farm (used for status approval)
 */

const BASE_URL = "https://rootverse-backend-5qoo.onrender.com";

/* ─── helpers ─── */
async function handleResponse(res) {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body?.detail || body?.message || message;
    } catch (_) {}
    throw new Error(message);
  }
  return res.json();
}

/* ─── service ─── */
export const farmService = {
  /**
   * GET /api/farms
   * @param {Object} params  – optional filters e.g. { status: "pending" }
   */
  getAllFarms: async (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ""))
    ).toString();
    const url = `${BASE_URL}/api/farms${qs ? `?${qs}` : ""}`;
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse(res);
  },

  /**
   * GET /api/farms/:id
   */
  getFarmById: async (id) => {
    const res = await fetch(`${BASE_URL}/api/farms/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse(res);
  },

  /**
   * PUT /api/farms/:id
   * Sends the full farm payload with the updated status field.
   * @param {number} id
   * @param {Object} farmData  – full farm object to send in body
   */
  updateFarm: async (id, farmData) => {
    const res = await fetch(`${BASE_URL}/api/farms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(farmData),
    });
    return handleResponse(res);
  },

  /**
   * Convenience: approve a farm by changing its status to "approved".
   * Merges the existing farm object with the new status to satisfy the PUT body schema.
   * @param {number} id
   * @param {Object} currentFarm – full current farm object from state
   */
  approveFarm: async (id, currentFarm) => {
    const payload = {
      name: currentFarm.name,
      location_id: currentFarm.location_id,
      owner_id: currentFarm.owner_id,
      total_area: currentFarm.total_area,
      water_source: currentFarm.water_source,
      farm_address: currentFarm.farm_address,
      country_id: currentFarm.country_id,
      state_id: currentFarm.state_id,
      district_id: currentFarm.district_id,
      pond_count: currentFarm.pond_count,
      latitude: currentFarm.latitude,
      longitude: currentFarm.longitude,
      status: "approved",
    };
    return farmService.updateFarm(id, payload);
  },

  /**
   * Convenience: reject a farm by changing its status to "rejected".
   */
  rejectFarm: async (id, currentFarm) => {
    const payload = {
      name: currentFarm.name,
      location_id: currentFarm.location_id,
      owner_id: currentFarm.owner_id,
      total_area: currentFarm.total_area,
      water_source: currentFarm.water_source,
      farm_address: currentFarm.farm_address,
      country_id: currentFarm.country_id,
      state_id: currentFarm.state_id,
      district_id: currentFarm.district_id,
      pond_count: currentFarm.pond_count,
      latitude: currentFarm.latitude,
      longitude: currentFarm.longitude,
      status: "rejected",
    };
    return farmService.updateFarm(id, payload);
  },
};