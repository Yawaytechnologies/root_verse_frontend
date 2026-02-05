const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://rootverse-backend-5qoo.onrender.com";

async function handle(res) {
  const contentType = res.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    data = text || null;
  }

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

function hasFile(payload) {
  return payload?.fish_type_image instanceof File;
}

function toFormData(payload) {
  const fd = new FormData();
  if (payload?.fish_name !== undefined) fd.append("fish_name", payload.fish_name);
  if (payload?.fish_code !== undefined) fd.append("fish_code", payload.fish_code);

  // ✅ upload field name
  if (payload?.fish_type_image instanceof File) {
    fd.append("fish_type_image", payload.fish_type_image);
  }

  return fd;
}

export async function getAllFishTypes() {
  const res = await fetch(`${API_BASE}/api/fish-types`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return handle(res);
}

export async function createFishType(payload) {
  const multipart = hasFile(payload);

  const res = await fetch(`${API_BASE}/api/fish-types`, {
    method: "POST",
    headers: multipart
      ? { Accept: "application/json" } // DO NOT set content-type for FormData
      : { "Content-Type": "application/json", Accept: "application/json" },
    body: multipart ? toFormData(payload) : JSON.stringify(payload),
  });

  return handle(res);
}

export async function updateFishType(id, payload) {
  const multipart = hasFile(payload);

  const res = await fetch(`${API_BASE}/api/fish-types/${id}`, {
    method: "PUT",
    headers: multipart
      ? { Accept: "application/json" }
      : { "Content-Type": "application/json", Accept: "application/json" },
    body: multipart ? toFormData(payload) : JSON.stringify(payload),
  });

  return handle(res);
}

export async function deleteFishType(id) {
  const res = await fetch(`${API_BASE}/api/fish-types/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  return handle(res);
}
