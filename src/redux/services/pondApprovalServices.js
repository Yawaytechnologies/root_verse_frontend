/**
 * pondApprovalServices.js
 * Pure API layer for Pond approval endpoints.
 */

const BASE_URL = "https://rootverse-backend-5qoo.onrender.com";

async function handleResponse(res) {
  let body;

  try {
    body = await res.json();
  } catch (_) {
    body = {};
  }

  if (!res.ok || body?.success === false) {
    throw new Error(body?.message || body?.detail || `HTTP ${res.status}`);
  }

  return body;
}

function buildPayload(pond, overrides = {}) {
  return {
    pond_name: pond.pond_name ?? pond.name ?? "",
    pond_type: pond.pond_type ?? null,
    water_spread_area_acres:
      pond.water_spread_area_acres ??
      pond.water_spread_area ??
      pond.area ??
      0,
    volume: pond.volume ?? null,
    farm_id: pond.farm_id ?? null,
    species_id: pond.species_id ?? null,
    pond_gps: pond.pond_gps ?? null,
    ...overrides,
  };
}

export const pondService = {
  getAllPonds: async (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v != null && v !== "")
      )
    ).toString();

    const res = await fetch(`${BASE_URL}/api/ponds${qs ? `?${qs}` : ""}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    return handleResponse(res);
  },

  getPondById: async (id) => {
    const res = await fetch(`${BASE_URL}/api/ponds/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    return handleResponse(res);
  },

  updatePond: async (id, pond, overrides = {}) => {
    const res = await fetch(`${BASE_URL}/api/ponds/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(pond, overrides)),
    });

    return handleResponse(res);
  },

  updatePondStatus: async (id, pondStatus) => {
    const res = await fetch(`${BASE_URL}/api/ponds/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pond_status: pondStatus,
      }),
    });

    return handleResponse(res);
  },

  updatePondVerificationStatus: async (id, verificationStatus) => {
    const res = await fetch(`${BASE_URL}/api/ponds/${id}/verification-status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        verification_status: verificationStatus,
      }),
    });

    return handleResponse(res);
  },

  approvePond: async (id) => {
    await pondService.updatePondVerificationStatus(id, "Verified");
    return await pondService.updatePondStatus(id, "Active");
  },

  unverifyPond: async (id) => {
    return await pondService.updatePondVerificationStatus(id, "Unverified");
  },

  rejectPond: async (id) => {
    // This will fail unless backend allows "Rejected".
    return await pondService.updatePondVerificationStatus(id, "Rejected");
  },

  setActive: async (id, isActive) => {
    return await pondService.updatePondStatus(
      id,
      isActive ? "Active" : "Inactive"
    );
  },
};