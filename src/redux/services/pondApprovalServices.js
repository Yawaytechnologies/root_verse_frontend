/**
 * pondService.js
 * Pure API layer for Pond endpoints.
 * Base URL: https://rootverse-backend-5qoo.onrender.com
 *
 * Endpoints used:
 *   GET  /api/ponds          – list all ponds (optional query params)
 *   GET  /api/ponds/:id      – get single pond
 *   PUT  /api/ponds/:id      – update pond (used for status approval)
 *
 * PUT body schema:
 *   { name, area, farm_id, species_id, status }
 */

const BASE_URL = "https://rootverse-backend-5qoo.onrender.com";

/* ─── helper ─── */
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
export const pondService = {
  /**
   * GET /api/ponds
   * @param {Object} params – optional filters e.g. { status: "pending", farm_id: 10 }
   */
  getAllPonds: async (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ""))
    ).toString();
    const url = `${BASE_URL}/api/ponds${qs ? `?${qs}` : ""}`;
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse(res);
  },

  /**
   * GET /api/ponds/:id
   */
  getPondById: async (id) => {
    const res = await fetch(`${BASE_URL}/api/ponds/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse(res);
  },

  /**
   * PUT /api/ponds/:id
   * Sends the full pond payload with an updated status.
   * @param {number}  id
   * @param {Object}  pondData – full pond body
   */
  updatePond: async (id, pondData) => {
    const res = await fetch(`${BASE_URL}/api/ponds/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pondData),
    });
    return handleResponse(res);
  },

  /**
   * Convenience: approve a pond (status → "approved").
   * Builds the required PUT body from the existing pond object.
   */
  approvePond: async (id, currentPond) => {
    const payload = {
      name:       currentPond.name,
      area:       currentPond.area,
      farm_id:    currentPond.farm_id,
      species_id: currentPond.species_id,
      status:     "approved",
    };
    return pondService.updatePond(id, payload);
  },

  /**
   * Convenience: reject a pond (status → "rejected").
   */
  rejectPond: async (id, currentPond) => {
    const payload = {
      name:       currentPond.name,
      area:       currentPond.area,
      farm_id:    currentPond.farm_id,
      species_id: currentPond.species_id,
      status:     "rejected",
    };
    return pondService.updatePond(id, payload);
  },
};