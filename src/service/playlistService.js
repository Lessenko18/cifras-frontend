import axios from "axios";

export const baseURL = "http://localhost:3000";

export async function getPlaylistsService() {
  const response = await axios.get(`${baseURL}/playlist/`);
  return response;
}

export async function createPlaylistService(data) {
  const response = await axios.post(`${baseURL}/playlist/create`, data);
  return response;
}
export async function deletePlaylistService(id) {
  const response = await axios.delete(`${baseURL}/playlist/delete/${id}`);
  return response;
}
export async function editPlaylistService(id, data) {
  const response = await axios.patch(`${baseURL}/playlist/update/${id}`, data);
  return response;
}
export async function getPlaylistViewService(id) {
  const { data } = await axios.get(`${baseURL}/playlist/${id}/view`);
  return data; 
}
