const BASE_URL = "https://rootverse-backend-5qoo.onrender.com";

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

export const ownerService = {
  /**
   * GET /api/owner/AQUACULTURE
   * Returns all owners for the aquaculture module.
   */
  getAllOwners: async () => {
    const res = await fetch(`${BASE_URL}/api/owner/AQUACULTURE`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse(res);
  },

  /**
   * POST /api/owner/:ownerId/verify
   * @param {number|string} ownerId
   * @param {"VERIFIED"|"REJECTED"} verification_status
   */
  verifyOwner: async (ownerId, verification_status) => {
    const res = await fetch(`${BASE_URL}/api/owner/${ownerId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verification_status }),
    });
    return handleResponse(res);
  },

  /** Convenience: approve → VERIFIED */
  approveOwner: (ownerId) =>
    ownerService.verifyOwner(ownerId, "VERIFIED"),

  /** Convenience: reject → REJECTED */
  rejectOwner: (ownerId) =>
    ownerService.verifyOwner(ownerId, "REJECTED"),
};