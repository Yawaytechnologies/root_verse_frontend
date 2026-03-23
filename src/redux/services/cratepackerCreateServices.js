// src/services/cratePacker/cratePackerApi.js
import axios from "axios";

const BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL?.trim() || "https://rootverse-backend-5qoo.onrender.com";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchCratePackersApi = async () => {
  const { data } = await api.get("/api/crate-packer");
  return data;
};

export const createCratePackerApi = async (payload) => {
  const { data } = await api.post("/api/crate-packer", payload);
  return data;
};

export const updateCratePackerApi = async (id, payload) => {
  const { data } = await api.put(`/api/crate-packer/${id}`, payload);
  return data;
};

export const deleteCratePackerApi = async (id) => {
  const { data } = await api.delete(`/api/crate-packer/${id}`);
  return data;
};

export const fetchLocationsApi = async () => {
  const { data } = await api.get("/api/locations");
  return data;
};