import { storage } from "../lib/storage";

// Tom (transposição em semitons) escolhido por cifra NESTE aparelho. Serve de
// preferência pessoal na cifra avulsa e de reserva nas playlists (o tom oficial
// da playlist vem do servidor). Chave: tom_<cifraId> — ver lib/storage.js.
const keyFor = (cifraId) => `tom_${cifraId}`;

export function getSavedTom(cifraId) {
  const raw = storage.get(keyFor(cifraId));
  const value = parseInt(raw, 10);
  return Number.isInteger(value) ? value : 0;
}

export function hasSavedTom(cifraId) {
  return storage.get(keyFor(cifraId)) !== null;
}

// 0 = tom original: não guarda nada.
export function saveTom(cifraId, semitones) {
  if (!cifraId) return;
  if (!semitones) storage.remove(keyFor(cifraId));
  else storage.set(keyFor(cifraId), semitones);
}
