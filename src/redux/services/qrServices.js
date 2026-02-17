// src/store/qr/qrApi.js
const API_BASE = "https://rootverse-backend-5qoo.onrender.com";

// ✅ now includes locationId + methodId
export async function bulkReserveQrs({ type, count, locationId, methodId }) {
  const res = await fetch(`${API_BASE}/api/bulk-reserve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      count: String(count),
      locationId, // backend requires
      methodId,   // backend requires
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to reserve QR batch");
  return data; // { success, count, qrs: [...] }
}
