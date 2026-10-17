import api from "./api";

// Somente ADM
export async function getAuditLogsService({ page = 0, limit = 30, entity, q } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (entity) params.set("entity", entity);
  if (q) params.set("q", q);
  const response = await api.get(`/audit?${params.toString()}`);
  return response.data;
}

export const AUDIT_ACTIONS = {
  cifra_criada: { label: "criou a cifra", tone: "ok" },
  cifra_editada: { label: "editou a cifra", tone: "info" },
  cifra_excluida: { label: "excluiu a cifra", tone: "danger" },
  playlist_excluida: { label: "excluiu a playlist", tone: "danger" },
  usuario_criado: { label: "criou o usuário", tone: "ok" },
  usuario_editado: { label: "editou o usuário", tone: "info" },
  usuario_excluido: { label: "excluiu o usuário", tone: "danger" },
  categoria_criada: { label: "criou a categoria", tone: "ok" },
  categoria_editada: { label: "editou a categoria", tone: "info" },
  categoria_excluida: { label: "excluiu a categoria", tone: "danger" },
  relato_excluido: { label: "excluiu um relato", tone: "danger" },
};

export const AUDIT_ENTITIES = [
  { value: "", label: "Tudo" },
  { value: "cifra", label: "Cifras" },
  { value: "playlist", label: "Playlists" },
  { value: "usuario", label: "Usuários" },
  { value: "categoria", label: "Categorias" },
  { value: "relato", label: "Relatos" },
];
