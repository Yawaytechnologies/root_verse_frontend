
// src/services/wild/fishingMethod.service.js
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "https://rootverse-backend-5qoo.onrender.com";

// ✅ Change this if your backend route is different
const BASE_PATH = "/api/fishing-methods";

const api = axios.create({
  baseURL: API_BASE,
});

// Optional: attach token if you use auth
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function unwrap(res) {
  // supports: {data: []} OR {success:true, data: []} OR plain []
  const d = res?.data;
  if (d == null) return d;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (d?.data != null) return d.data;
  return d;
}

async function getAll() {
  const res = await api.get(`${BASE_PATH}`);
  return unwrap(res);
}

async function create(payload) {
  // payload: { method_name, method_code, imageFile? }
  const fd = new FormData();
  fd.append("method_name", payload.method_name);
  fd.append("method_code", payload.method_code);

  // ✅ backend commonly expects "image"
  if (payload.imageFile) fd.append("image", payload.imageFile);

  const res = await api.post(`${BASE_PATH}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return unwrap(res);
}

async function update(id, payload) {
  const fd = new FormData();
  fd.append("method_name", payload.method_name);
  fd.append("method_code", payload.method_code);
  if (payload.imageFile) fd.append("image", payload.imageFile);

  const res = await api.put(`${BASE_PATH}/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return unwrap(res);
}

async function remove(id) {
  const res = await api.delete(`${BASE_PATH}/${id}`);
  return unwrap(res);
}

const fishingMethodService = {
  getAll,
  create,
  update,
  remove,
};

export default fishingMethodService;
