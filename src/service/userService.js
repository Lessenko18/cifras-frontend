import api from "./api";

export async function getUsersService() {
  const response = await api.get("/user/");
  return response;
}

export async function createUserService(data) {
  const response = await api.post("/user/create", data);
  return response;
}

export async function deleteUserService(id) {
  const response = await api.delete(`/user/delete/${id}`);
  return response;
}

export async function editUserService(id, data) {
  const response = await api.patch(`/user/update/${id}`, data);
  return response;
}
