// src/redux/services/ownerLookupServices.js
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

// ✅ owners list endpoint used earlier: /api/owner/WILD_CAPTURE
export async function fetchOwnersWildCaptureApi() {
  const res = await fetch(`${API_BASE}/api/owner/WILD_CAPTURE`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return handle(res);
}
