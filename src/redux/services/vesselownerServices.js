
const API_BASE = import.meta.env.VITE_API_BASE || "https://rootverse-backend-5qoo.onrender.com";

async function parseJsonSafe(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text };
  }
}

export async function fetchOwnersWildCapture() {
  const res = await fetch(`${API_BASE}/api/owner/WILD_CAPTURE`);
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.message || "Failed to fetch owners");
  return data; // { users: [...] }
}

export async function verifyOwnerKyc({ ownerId, formData }) {
  const res = await fetch(`${API_BASE}/api/owner/${ownerId}/verify`, {
    method: "PUT",
    body: formData, // multipart/form-data (DON'T set content-type)
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.message || "Failed to update owner verification");
  return data;
}