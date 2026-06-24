const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://rootverse-backend-5qoo.onrender.com"
).replace(/\/+$/, "");

const TOKEN_KEYS = [
  "adminToken",
  "admin_token",
  "accessToken",
  "access_token",
  "token",
  "rootverse_admin_token",
];

function cleanUrl(value) {
  if (!value || typeof value !== "string") return "";
  return value.replace(/%22$/g, "").replace(/"$/g, "");
}

function readToken() {
  for (const key of TOKEN_KEYS) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      return (
        parsed?.access_token ||
        parsed?.accessToken ||
        parsed?.token ||
        parsed?.data?.access_token ||
        parsed?.data?.accessToken ||
        parsed?.data?.token ||
        ""
      );
    } catch {
      return raw;
    }
  }

  return "";
}

async function apiRequest(path, options = {}) {
  const token = readToken();

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();

  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    const error = new Error(message);
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
}

export function getTraderStatusKey(trader) {
  const rawStatus = String(
    trader?.approval_status ||
      trader?.approvalStatus ||
      trader?.verification_status ||
      trader?.verificationStatus ||
      trader?.trader_status ||
      trader?.traderStatus ||
      trader?.status ||
      ""
  ).toLowerCase();

  if (rawStatus.includes("pending")) return "pending";
  if (rawStatus.includes("reject")) return "rejected";
  if (
    rawStatus.includes("approve") ||
    rawStatus.includes("active") ||
    rawStatus.includes("verified")
  ) {
    return "approved";
  }

  if (trader?.is_active === true) return "approved";
  if (trader?.is_active === false) return "rejected";

  return "pending";
}

export function getTraderStatusLabel(trader) {
  const key = getTraderStatusKey(trader);
  if (key === "approved") return "Approved";
  if (key === "rejected") return "Rejected";
  return "Pending";
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function normalizeTrader(trader) {
  if (!trader || typeof trader !== "object") return trader;

  return {
    ...trader,
    profile_image_url: cleanUrl(trader.profile_image_url),
    company_logo_url: cleanUrl(trader.company_logo_url),
    operational_districts: normalizeArray(trader.operational_districts),
    quality_checkers: normalizeArray(trader.quality_checkers),
    crate_packers: normalizeArray(trader.crate_packers),
    transport_operators: normalizeArray(trader.transport_operators),
  };
}

export function normalizeTraderList(payload) {
  const raw =
    payload?.data?.traders ||
    payload?.data?.items ||
    payload?.data?.rows ||
    payload?.traders ||
    payload?.items ||
    payload?.rows ||
    payload?.data ||
    payload;

  if (Array.isArray(raw)) {
    return raw.map(normalizeTrader);
  }

  return [];
}

export function normalizeTraderDetail(payload) {
  const raw =
    payload?.data?.trader ||
    payload?.trader ||
    payload?.data ||
    payload;

  if (!raw || Array.isArray(raw)) return null;

  return normalizeTrader(raw);
}

export async function fetchTradersApi() {
  const data = await apiRequest("/api/traders", {
    method: "GET",
  });

  return normalizeTraderList(data);
}

export async function fetchTraderByIdApi(traderId) {
  try {
    const data = await apiRequest(`/api/traders/${traderId}`, {
      method: "GET",
    });

    const trader = normalizeTraderDetail(data);
    if (trader?.id) return trader;
  } catch {
    // fallback below because your Swagger screenshot only confirms GET /api/traders
  }

  const traders = await fetchTradersApi();

  const trader = traders.find(
    (item) =>
      String(item.id) === String(traderId) ||
      String(item.trader_code) === String(traderId)
  );

  if (!trader) {
    throw new Error("Trader not found");
  }

  return trader;
}