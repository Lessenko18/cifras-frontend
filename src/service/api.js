import axios from "axios";
import { queryClient } from "../lib/queryClient";
import { storage } from "../lib/storage";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Envia o token via header em ambientes cross-origin (ex: iOS Safari bloqueia cookies entre domínios)
api.interceptors.request.use((config) => {
  const token = storage.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Só força redirect se havia sessão (token expirado/inválido).
      // Visitantes sem login batendo em rota protegida (ex: favoritos) não devem ser expulsos.
      const hadToken = Boolean(storage.get("access_token"));
      storage.remove("user");
      storage.remove("access_token");
      queryClient.clear();
      if (hadToken) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
