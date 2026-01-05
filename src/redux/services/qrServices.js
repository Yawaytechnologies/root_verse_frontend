// src/store/qr/qrApi.js

const API_BASE = "https://rootverse-backend.onrender.com";

// ✅ link only (as requested)
export async function bulkReserveQrs({ type, count }) {
  const res = await fetch(`${API_BASE}/api/bulk-reserve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      count: String(count), // backend accepts "10" as string
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to reserve QR batch");
  return data; // { success, count, qrs: [...] }
}
