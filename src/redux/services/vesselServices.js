// src/redux/services/vesselServices.js
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://rootverse-backend-5qoo.onrender.com";

async function handle(res) {
  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export async function fetchVesselsApi() {
  const res = await fetch(`${API_BASE}/api/vessels`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return handle(res);
}

export async function createVesselApi(payload) {
  const res = await fetch(`${API_BASE}/api/vessels`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function updateVesselApi(id, payload) {
  const res = await fetch(`${API_BASE}/api/vessels/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}
