import { storage } from "../lib/storage";

// Cópia local das últimas cifras abertas, para reabrir sem sinal (igreja, palco). Fica só
// neste aparelho; guarda no máximo MAX cifras (a mais antiga sai). Chaves: cifra_cache_<id>
// e cifra_cache_index (ids, da mais antiga para a mais recente).
const MAX = 30;
const INDEX_KEY = "cifra_cache_index";
const keyFor = (id) => `cifra_cache_${id}`;

export function saveCifraCache(id, cifra) {
  if (!id || !cifra?._id) return;
  const index = storage.getJSON(INDEX_KEY, []).filter((x) => x !== String(id));
  if (!storage.setJSON(keyFor(id), cifra)) return; // cota cheia ou storage bloqueado
  index.push(String(id));
  while (index.length > MAX) storage.remove(keyFor(index.shift()));
  storage.setJSON(INDEX_KEY, index);
}

export const loadCifraCache = (id) => storage.getJSON(keyFor(id), null);
