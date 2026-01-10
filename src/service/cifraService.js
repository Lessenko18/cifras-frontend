import axios from "axios";

export const baseURL = "http://localhost:3000";
// export const baseURL = "https://cifrasbackend-main.onrender.com";

export async function getCifrasService() {
  const response = await axios.get(`${baseURL}/cifra/`);
  return response;
}

export async function getCifraById(id) {
  const response = await axios.get(`${baseURL}/cifra/${id}`);
  return response;
}

export async function createCifraService(data) {
  const response = await axios.post(`${baseURL}/cifra/create`, data);
  return response;
}
export async function deleteCifraService(id) {
  const response = await axios.delete(`${baseURL}/cifra/delete/${id}`);
  return response;
}
export async function editCifraService(id, data) {
  const response = await axios.patch(`${baseURL}/cifra/update/${id}`, data);
  return response;
}
export async function searchCifra(data) {
  const response = await axios.get(`${baseURL}/cifra/search?nome=${data}`);
  return response;
}
