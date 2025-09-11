import axios from "axios";

export const baseURL = "http://localhost:3000";

export async function getUsersService() {
  const response = await axios.get(`${baseURL}/user/`);
  return response;
}

export async function createUserService(data) {
  const response = await axios.post(`${baseURL}/user/create`, data);
  return response;
}
export async function deleteUserService(id) {
  const response = await axios.delete(`${baseURL}/user/delete/${id}`);
  return response;
}
export async function editUserService(id, data) {
  const response = await axios.patch(`${baseURL}/user/update/${id}`, data);
  return response;
}
