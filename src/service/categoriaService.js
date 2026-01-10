import api from "./api";

export async function getCategoriasService() {
  const response = await api.get("/categoria/");
  return response;
}

export async function searchCategoria(data) {
  const response = await api.get(`/categoria/search?nome=${data}`);
  return response;
}

export async function createCategoriaService(data) {
  const response = await api.post("/categoria/create", data);
  return response;
}

export async function getCategoriaById(id) {
  const response = await api.get(`/categoria/${id}`);
  return response;
}

export async function deleteCategoriaService(id) {
  const response = await api.delete(`/categoria/delete/${id}`);
  return response;
}

export async function editCategoriaService(id, data) {
  const response = await api.patch(`/categoria/update/${id}`, data);
  return response;
}
