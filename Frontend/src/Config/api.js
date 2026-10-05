import axios from "axios";
// Set the API origin when a backend is available. Never store secrets in VITE_*.
export const API_HOST = import.meta.env.VITE_API_ORIGIN || "";

export const API_BASE_URL = API_HOST
  ? `${API_HOST.replace(/\/+$/, "")}/api`
  : "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});
