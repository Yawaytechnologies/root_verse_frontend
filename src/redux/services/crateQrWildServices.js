const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://rootverse-backend-5qoo.onrender.com";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      ...(options.headers || {}),
    },
    body: options.body,
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new Error(json?.message || json?.error || `Request failed (${res.status})`);
  }
  return json;
}

export const fetchDistricts = async () => {
  const json = await apiFetch("/api/districts");
  // ✅ your exact response: { success, message, data: [...] }
  return Array.isArray(json?.data) ? json.data : [];
};

export const createBatch = async ({ type, count, districtId }) => {
  const json = await apiFetch("/api/crate/create-batch", {
    method: "POST",
    body: JSON.stringify({ type, count, districtId }),
  });
  return Array.isArray(json?.qrs) ? json.qrs : [];
};