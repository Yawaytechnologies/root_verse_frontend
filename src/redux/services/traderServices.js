// src/redux/services/traderServices.js

const RAW_API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  "https://rootverse-backend-5qoo.onrender.com";

function cleanBaseUrl(value) {
  let base = String(value || "").trim().replace(/\/+$/, "");

  // If env has https://domain.com/api, convert to https://domain.com
  if (base.endsWith("/api")) {
    base = base.slice(0, -4);
  }

  return base;
}

const API_BASE = cleanBaseUrl(RAW_API_BASE);
const TRADER_URL = `${API_BASE}/api/traders`;

/**
 * IMPORTANT:
 * Admin login code already saves token like this:
 * localStorage.setItem("access_token", accessToken)
 *
 * So trader approval must use the same access_token.
 */
function getAdminAccessToken() {
  return localStorage.getItem("access_token") || "";
}

function authHeaders() {
  const token = getAdminAccessToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
  };
}

async function handleResponse(response) {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || data?.success === false) {
    const message =
      data?.message ||
      data?.error ||
      data?.errors?.[0]?.message ||
      `Request failed: ${response.status}`;

    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * GET /api/traders
 * Trader approval list
 */
export async function getTraderOrganizationsService() {
  const response = await fetch(TRADER_URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...authHeaders(),
    },
  });

  return handleResponse(response);
}

/**
 * PATCH /api/traders/:id/status
 */
export async function updateTraderStatusService(traderId, payload) {
  if (!traderId) {
    throw new Error("Trader ID is required");
  }

  const body = {
    status: payload?.status,
    is_active: payload?.is_active,
  };

  const response = await fetch(`${TRADER_URL}/${traderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  });

  return handleResponse(response);
}

/**
 * POST /api/traders
 */
export async function createTraderOrganizationService(payload) {
  const formData = new FormData();

  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (key === "operational_districts" && Array.isArray(value)) {
      value.forEach((district) => {
        if (district) {
          formData.append("operational_districts", district);
        }
      });
      return;
    }

    formData.append(key, value);
  });

  const response = await fetch(TRADER_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...authHeaders(),
    },
    body: formData,
  });

  return handleResponse(response);
}