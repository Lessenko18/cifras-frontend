import { storage } from "../lib/storage";

// BPM que a pessoa prefere para uma cifra, neste aparelho. Vale para quem não pode editar
// a cifra (o BPM oficial, salvo na cifra, só quem gerencia altera). Chave: bpm_<cifraId>.
const keyFor = (cifraId) => `bpm_${cifraId}`;

export function getLocalBpm(cifraId) {
  const n = parseInt(storage.get(keyFor(cifraId)), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function saveLocalBpm(cifraId, bpm) {
  if (cifraId) storage.set(keyFor(cifraId), Math.round(bpm));
}
