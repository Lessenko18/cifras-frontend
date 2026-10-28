// Cópia local de playlists para uso sem sinal (igreja, salão de festa).
// Fica só neste aparelho e é apagada no logout.
const PREFIX = "offline_playlist_";

export function hasOfflinePlaylist(id) {
  try {
    return localStorage.getItem(PREFIX + id) !== null;
  } catch {
    return false;
  }
}

export function saveOfflinePlaylist(id, viewData) {
  try {
    localStorage.setItem(PREFIX + id, JSON.stringify(viewData));
    return true;
  } catch {
    return false; // cota cheia ou storage bloqueado
  }
}

export function loadOfflinePlaylist(id) {
  try {
    const raw = localStorage.getItem(PREFIX + id);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function removeOfflinePlaylist(id) {
  try {
    localStorage.removeItem(PREFIX + id);
  } catch {
    // nada a fazer
  }
}

export function clearOfflinePlaylists() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // nada a fazer
  }
}
