import api from "./api";

export async function getPlaylistsService() {
  const response = await api.get("/playlist/");
  return response;
}

export async function createPlaylistService(data) {
  const response = await api.post("/playlist/create", data);
  return response;
}

export async function deletePlaylistService(id) {
  const response = await api.delete(`/playlist/delete/${id}`);
  return response;
}

export async function editPlaylistService(id, data) {
  const response = await api.patch(`/playlist/update/${id}`, data);
  return response;
}

export async function getPlaylistViewService(id) {
  const { data } = await api.get(`/playlist/${id}/view`);
  return data;
}
