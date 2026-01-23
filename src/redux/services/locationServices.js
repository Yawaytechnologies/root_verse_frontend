// src/redux/services/locationServices.js
const MASTER_BASE =
  import.meta.env.VITE_MASTER_API_BASE_URL || "https://rootverse-backend-5qoo.onrender.com";

async function handle(res) {
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export async function getAllStates() {
  const res = await fetch(`${MASTER_BASE}/api/states`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return handle(res);
}

export async function getAllDistricts() {
  const res = await fetch(`${MASTER_BASE}/api/districts`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return handle(res);
}
