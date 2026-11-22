import { storage } from "../lib/storage";
import { wrapSemitones } from "./transpose";

// Tom (transposição em semitons) escolhido por cifra NESTE aparelho. Serve de
// preferência pessoal na cifra avulsa e de reserva nas playlists (o tom oficial
// da playlist vem do servidor). Chave: tom_<cifraId> — ver lib/storage.js.
const keyFor = (cifraId) => `tom_${cifraId}`;

export function getSavedTom(cifraId) {
  const raw = storage.get(keyFor(cifraId));
  const value = parseInt(raw, 10);
  return Number.isInteger(value) ? wrapSemitones(value) : 0;
}

export function hasSavedTom(cifraId) {
  return storage.get(keyFor(cifraId)) !== null;
}

// 0 = tom original: não guarda nada.
export function saveTom(cifraId, semitones) {
  if (!cifraId) return;
  // +12 é o mesmo tom que 0: guarda sempre entre -5 e +6
  const value = wrapSemitones(semitones);
  if (!value) storage.remove(keyFor(cifraId));
  else storage.set(keyFor(cifraId), value);
}
