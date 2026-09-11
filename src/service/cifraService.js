import api from "./api";

export async function getCifrasService({ nome, artista, categorias, favoritos, page = 0, limit = 15 } = {}) {
  const params = new URLSearchParams();
  if (nome) params.set("nome", nome);
  if (artista) params.set("artista", artista);
  if (categorias?.length) params.set("categorias", categorias.join(","));
  if (favoritos?.length) params.set("favoritos", favoritos.join(","));
  params.set("page", String(page));
  params.set("limit", String(limit));

  const response = await api.get(`/cifra/?${params.toString()}`);
  return response;
}

export async function getCifraHomeInsightsService(limit = 6) {
  const response = await api.get(`/cifra/insights/home?limit=${limit}`);
  return response;
}

export async function registerCifraAccessService(id) {
  const response = await api.post(`/cifra/${id}/acesso`);
  return response;
}

export async function getCifraById(id) {
  const response = await api.get(`/cifra/${id}`);
  return response;
}

export async function createCifraService(data) {
  const response = await api.post("/cifra/create", data);
  return response;
}

export async function deleteCifraService(id) {
  const response = await api.delete(`/cifra/delete/${id}`);
  return response;
}

export async function editCifraService(id, data) {
  const response = await api.patch(`/cifra/update/${id}`, data);
  return response;
}
