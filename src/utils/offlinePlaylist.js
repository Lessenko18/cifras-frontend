import { storage } from "../lib/storage";

// Cópia local de playlists para uso sem sinal (igreja, salão de festa).
// Fica só neste aparelho e é apagada no logout.
const PREFIX = "offline_playlist_";

export const hasOfflinePlaylist = (id) => storage.get(PREFIX + id) !== null;

// false se a cota do navegador estiver cheia ou o storage bloqueado
export const saveOfflinePlaylist = (id, viewData) => storage.setJSON(PREFIX + id, viewData);

export const loadOfflinePlaylist = (id) => storage.getJSON(PREFIX + id, null);

export const removeOfflinePlaylist = (id) => storage.remove(PREFIX + id);

export const clearOfflinePlaylists = () => storage.removeWithPrefix(PREFIX);
