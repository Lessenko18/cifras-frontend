// Quem pode fazer o quê com uma playlist. Era copiado em Home e Playlist; agora
// é uma função só. O backend continua sendo a autoridade (esta checagem só decide
// quais botões mostrar).

const OWNER_KEYS = ["criador", "ownerId", "userId", "usuarioId", "criadoPorId", "createdById", "owner", "user", "usuario", "criadoPor", "createdBy"];
const SHARED_KEYS = ["sharedWithEmails", "sharedWith", "sharedWithUsers", "sharedUsers", "compartilhadoCom"];

const idOf = (v) => (v && typeof v === "object" ? v._id || v.id || null : v || null);

export function getPlaylistOwnerId(playlist) {
  for (const key of OWNER_KEYS) {
    const id = idOf(playlist?.[key]);
    if (id) return id;
  }
  return null;
}

function getSharedList(playlist) {
  for (const key of SHARED_KEYS) {
    if (playlist?.[key]) return playlist[key];
  }
  return [];
}

export function isPlaylistSharedWith(playlist, user) {
  const list = getSharedList(playlist);
  if (!Array.isArray(list) || list.length === 0) return false;

  const userId = user?._id || user?.id || null;
  const userEmail = user?.email?.toLowerCase() || "";

  return list.some((item) => {
    if (!item) return false;
    if (typeof item === "string") return Boolean(userEmail) && item.toLowerCase() === userEmail;

    const itemId = item._id || item.id || item.userId || item.usuarioId;
    const itemEmail = item.email || item.mail;
    if (userId && itemId && itemId === userId) return true;
    return Boolean(userEmail && itemEmail) && itemEmail.toLowerCase() === userEmail;
  });
}

/**
 * Dono (ou ADM) compartilha e exclui; quem recebeu a playlist só edita.
 * Sem dono identificável, assume que é do usuário, a menos que tenha sido compartilhada.
 */
export function getPlaylistPermissions(playlist, user, isAdmin = false) {
  const userId = user?._id || user?.id || null;
  const ownerId = getPlaylistOwnerId(playlist);
  const shared = isPlaylistSharedWith(playlist, user);
  const isOwner = ownerId ? ownerId === userId : !shared;

  return {
    isOwner,
    shared,
    canShare: isOwner || isAdmin,
    canEdit: isOwner || isAdmin || shared,
    canDelete: isOwner || isAdmin,
  };
}
