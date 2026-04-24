import api from "./api";

export async function getCifrasService({ nome, categorias, favoritos, page = 0, limit = 15 } = {}) {
  const params = new URLSearchParams();
  if (nome) params.set("nome", nome);
  if (categorias?.length) params.set("categorias", categorias.join(","));
  if (favoritos?.length) params.set("favoritos", favoritos.join(","));
  params.set("page", String(page));
  params.set("limit", String(limit));

  const response = await api.get(`/cifra/?${params.toString()}`);
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
