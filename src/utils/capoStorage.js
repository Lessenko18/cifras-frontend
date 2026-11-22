import { useSyncExternalStore } from "react";
import { storage } from "../lib/storage";

// Capotraste escolhido por cifra NESTE aparelho (0 = sem capo, 1–11 = casa). O tom da
// cifra continua sendo o que SOA; o capo só muda as FORMAS de acorde mostradas na tela:
// formas = tom que soa - casa do capo. Chave: capo_<cifraId> (ver lib/storage.js).
export const MAX_CAPO = 11;
const keyFor = (cifraId) => `capo_${cifraId}`;

const listeners = new Set();
let version = 0;
const subscribe = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

export function getCapo(cifraId) {
  const n = parseInt(storage.get(keyFor(cifraId)), 10);
  return Number.isInteger(n) ? Math.min(MAX_CAPO, Math.max(0, n)) : 0;
}

export function saveCapo(cifraId, capo) {
  if (!cifraId) return;
  const value = Math.min(MAX_CAPO, Math.max(0, Math.trunc(Number(capo)) || 0));
  if (value === 0) storage.remove(keyFor(cifraId));
  else storage.set(keyFor(cifraId), value);
  version += 1;
  listeners.forEach((l) => l());
}

// Re-renderiza quando o capo daquela cifra muda
export const useCapo = (cifraId) => useSyncExternalStore(subscribe, () => getCapo(cifraId));

// Re-renderiza quando o capo de QUALQUER cifra muda (para listas, como a playlist)
export const useCapoVersion = () => useSyncExternalStore(subscribe, () => version);

// Deslocamento a aplicar nos acordes para tocar com capo
export const shapeSemitones = (semitones, capo = 0) => semitones - capo;
