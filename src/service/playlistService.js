import api from "./api";

export async function getPlaylistsService() {
  const response = await api.get("/playlist/");
  return response;
}

export async function createPlaylistService(data) {
  const response = await api.post("/playlist/create", data);
  return response;
}

function buildPlaylistFormData(data) {
  const formData = new FormData();
  if (data.nome !== undefined) formData.append("nome", data.nome);
  (data.cifras || []).forEach((id) => formData.append("cifras", id));
  (data.sharedWithEmails || []).forEach((email) => formData.append("sharedWithEmails", email));
  if (data.appUrl) formData.append("appUrl", data.appUrl);
  if (data.frontendUrl) formData.append("frontendUrl", data.frontendUrl);
  if (data.bannerFile) formData.append("banner", data.bannerFile);
  return formData;
}

// Variante com upload de capa (imagem) — usa multipart/form-data
export async function createPlaylistWithBannerService({ bannerFile, ...data }) {
  const formData = buildPlaylistFormData({ ...data, bannerFile });
  const response = await api.post("/playlist/create", formData);
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

// Variante com upload de capa (imagem) — usa multipart/form-data
export async function editPlaylistWithBannerService(id, { bannerFile, ...data }) {
  const formData = buildPlaylistFormData({ ...data, bannerFile });
  const response = await api.patch(`/playlist/update/${id}`, formData);
  return response;
}

export async function getPlaylistViewService(id) {
  const { data } = await api.get(`/playlist/${id}/view`);
  return data;
}

export async function getPlaylistByIdService(id) {
  const { data } = await api.get(`/playlist/${id}`);
  return data;
}

export async function sharePlaylistService(id, payload) {
  const response = await api.post(`/playlist/${id}/share`, payload);
  return response;
}

export async function unsharePlaylistService(id, payload) {
  const response = await api.delete(`/playlist/${id}/share`, { data: payload });
  return response;
}

export async function getPlaylistSharesService(id) {
  const { data } = await api.get(`/playlist/${id}/shares`);
  return data;
}
