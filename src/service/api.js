import axios from "axios";
import { queryClient } from "../lib/queryClient";
import { storage } from "../lib/storage";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Migração única: versões antigas guardavam o JWT no localStorage. Apaga o token
// (era legível por qualquer script) e mantém a pessoa "logada" pelo cookie.
if (storage.get("access_token")) {
  storage.remove("access_token");
  storage.set("has_session", "1");
}

// A sessão vive SÓ no cookie httpOnly (o JS não enxerga o token). `has_session` é
// apenas um marcador "provavelmente logado" para não chamar /auth/me à toa.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Só força redirect se havia sessão (cookie expirado/inválido).
      // Visitantes sem login batendo em rota protegida (ex: favoritos) não devem ser expulsos.
      const hadSession = Boolean(storage.get("has_session"));
      storage.remove("user");
      storage.remove("has_session");
      queryClient.clear();
      if (hadSession) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
