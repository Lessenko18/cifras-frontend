import api from "./api";

export async function getCifrasService() {
  const response = await api.get("/cifra/");
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

export async function searchCifra(data) {
  const response = await api.get(`/cifra/search?nome=${data}`);
  return response;
}
