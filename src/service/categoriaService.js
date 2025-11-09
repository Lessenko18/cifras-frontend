import axios from "axios";

export const baseURL = "https://cifrasbackend-main.onrender.com";

export async function getCategoriasService() {
  const response = await axios.get(`${baseURL}/categoria/`);
  return response;
}
export async function searchCategoria(data) {
  const response = await axios.get(`${baseURL}/categoria/search?nome=${data}`);
  return response;
}

export async function createCategoriaService(data) {
  const response = await axios.post(`${baseURL}/categoria/create`, data);
  return response;
}
export async function getCategoriaById(id) {
  const response = await axios.get(`${baseURL}/categoria/${id}`);
  return response;
}
export async function deleteCategoriaService(id) {
  const response = await axios.delete(`${baseURL}/categoria/delete/${id}`);
  return response;
}
export async function editCategoriaService(id, data) {
  const response = await axios.patch(`${baseURL}/categoria/update/${id}`, data);
  return response;
}
