// src/redux/services/speciesServices.js

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://rootverse-backend-5qoo.onrender.com";

async function handle(res) {
  const contentType = res.headers.get("content-type") || "";
  let data = null;

  // safer parse: only JSON when server says JSON
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    data = text || null;
  }

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

// ✅ GET all species
export async function getAllFishTypes() {
  const res = await fetch(`${API_BASE}/api/fish-types`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return handle(res);
}

// ✅ CREATE species { fish_name, fish_code }
export async function createFishType(payload) {
  const res = await fetch(`${API_BASE}/api/fish-types`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

// ✅ UPDATE species { fish_name, fish_code }
export async function updateFishType(id, payload) {
  const res = await fetch(`${API_BASE}/api/fish-types/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

// ✅ DELETE species
export async function deleteFishType(id) {
  const res = await fetch(`${API_BASE}/api/fish-types/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  return handle(res);
}
