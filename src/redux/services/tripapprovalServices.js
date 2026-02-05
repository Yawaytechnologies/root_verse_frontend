// src/redux/services/tripapprovalServices.js

const RAW_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://rootverse-backend-5qoo.onrender.com";

const API_BASE = String(RAW_BASE).replace(/\/+$/, ""); // remove trailing /

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

export async function fetchTripsByStatusApi(status) {
  const s = String(status || "").toLowerCase();
  const res = await fetch(`${API_BASE}/api/trip/status/${s}`, {
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

// ✅ Trip details by numeric id (used on Details click)
export async function fetchTripDetailsApi(tripId) {
  const res = await fetch(`${API_BASE}/api/trip/${tripId}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return handle(res);
}

// ✅ Catchlogs by trip_id (numeric id)
export async function fetchCatchlogsForTripApi(tripId, qcStatus = "all") {
  const qs = new URLSearchParams();
  qs.set("trip_id", String(tripId));

  // backend example: /api/catchlogs?qcStatus=checked
  // so we keep qcStatus key
  const q = String(qcStatus || "all").toLowerCase();
  if (q && q !== "all") qs.set("qcStatus", q);

  const res = await fetch(`${API_BASE}/api/catchlogs?${qs.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return handle(res);
}
