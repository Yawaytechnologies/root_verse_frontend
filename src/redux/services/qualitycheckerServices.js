// src/redux/services/qualitycheckerServices.js
const QC_BASE =
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

export async function getAllQualityCheckers() {
  const res = await fetch(`${QC_BASE}/api/quality-checker/`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return handle(res);
}

export async function getQualityCheckerByCode(code) {
  const res = await fetch(
    `${QC_BASE}/api/quality-checker/${encodeURIComponent(code)}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
    }
  );
  return handle(res);
}

export async function createQualityChecker(payload) {
  const res = await fetch(`${QC_BASE}/api/quality-checker/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function updateQualityChecker(id, payload) {
  const res = await fetch(`${QC_BASE}/api/quality-checker/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function deleteQualityChecker(id) {
  const res = await fetch(`${QC_BASE}/api/quality-checker/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  return handle(res);
}

export async function getAllLocations() {
  const res = await fetch(`${QC_BASE}/api/locations/`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return handle(res);
}

export async function getDistrictsByState(stateId) {
  const res = await fetch(`${QC_BASE}/api/districts?state_id=${stateId}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return handle(res);
}

export async function getLocationsByState(stateId) {
  const res = await fetch(`${QC_BASE}/api/locations?state_id=${stateId}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return handle(res);
}