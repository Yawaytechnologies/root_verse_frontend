// src/redux/services/tripServices.js

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://rootverse-backend-5qoo.onrender.com";

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

export async function fetchAllTrips() {
  const res = await fetch(`${API_BASE}/api/trip`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return handle(res);
}

export async function approveTripApi(tripId) {
  const res = await fetch(`${API_BASE}/api/trip/${tripId}/approve`, {
    method: "PUT",
    headers: { Accept: "application/json" },
  });
  return handle(res);
}
