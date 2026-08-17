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

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function getProcessorStatusKey(processor) {
  const rawStatus = String(
    processor?.approval_status ||
      processor?.approvalStatus ||
      processor?.verification_status ||
      processor?.verificationStatus ||
      processor?.status ||
      ""
  ).toLowerCase();

  if (rawStatus.includes("pending")) return "pending";
  if (rawStatus.includes("reject") || rawStatus.includes("inactive")) {
    return "rejected";
  }
  if (
    rawStatus.includes("approve") ||
    rawStatus.includes("active") ||
    rawStatus.includes("verified")
  ) {
    return "approved";
  }

  if (processor?.is_active === true) return "approved";
  if (processor?.is_active === false) return "rejected";

  return "pending";
}

export function getProcessorStatusLabel(processor) {
  const key = getProcessorStatusKey(processor);
  if (key === "approved") return "Approved";
  if (key === "rejected") return "Rejected";
  return "Pending";
}

export function normalizeProcessor(processor) {
  if (!processor || typeof processor !== "object") return processor;

  return {
    ...processor,
    profile_image_url: cleanUrl(processor.profile_image_url),
    company_logo_url: cleanUrl(processor.company_logo_url),
    logo_url: cleanUrl(processor.logo_url),
    operational_districts: normalizeArray(processor.operational_districts),
  };
}

export function normalizeProcessorList(payload) {
  const raw =
    payload?.data?.processors ||
    payload?.data?.items ||
    payload?.data?.rows ||
    payload?.processors ||
    payload?.items ||
    payload?.rows ||
    payload?.data ||
    payload;

  if (Array.isArray(raw)) {
    return raw.map(normalizeProcessor);
  }

  return [];
}

export function normalizeProcessorDetail(payload) {
  const raw =
    payload?.data?.processor ||
    payload?.processor ||
    payload?.data ||
    payload;

  if (!raw || Array.isArray(raw)) return null;

  return normalizeProcessor(raw);
}

export async function fetchProcessorsApi() {
  const data = await apiRequest("/api/processors?page=1&page_size=100", {
    method: "GET",
  });

  return normalizeProcessorList(data);
}

export async function fetchProcessorByIdApi(processorId) {
  try {
    const data = await apiRequest(`/api/processors/${processorId}`, {
      method: "GET",
    });

    const processor = normalizeProcessorDetail(data);
    if (processor?.id) return processor;
  } catch {
    // fallback below
  }

  const processors = await fetchProcessorsApi();

  const processor = processors.find(
    (item) =>
      String(item.id) === String(processorId) ||
      String(item.processor_code) === String(processorId)
  );

  if (!processor) {
    throw new Error("Processor not found");
  }

  return processor;
}

export async function updateProcessorStatusApi(processorId, nextStatus) {
  const statusKey = String(nextStatus || "").toLowerCase();
  const isApprove = statusKey === "approved" || statusKey === "approve";
  const apiStatus = isApprove ? "APPROVED" : "REJECTED";

  const data = await apiRequest(`/api/processors/${processorId}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status: apiStatus,
      approval_status: apiStatus,
      verification_status: apiStatus,
      is_active: isApprove,
    }),
  });

  return normalizeProcessorDetail(data) || { id: processorId, status: apiStatus };
}
