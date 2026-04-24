import api from "./api";

export async function getFavoritosService() {
  const response = await api.get("/user/favoritos");
  return response.data.favoritos || [];
}

export async function toggleFavoritoService(cifraId) {
  const response = await api.post(`/user/favoritos/${cifraId}`);
  return response.data.favoritos || [];
}
