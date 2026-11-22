import { useSyncExternalStore } from "react";
import { storage } from "./storage";

// Fábrica de preferência guardada no aparelho (via lib/storage, que nunca lança) e
// observável pelo React: quem usa `use()` re-renderiza quando alguém chama `set()`.
//   parse(raw)   transforma o texto salvo (ou null) no valor — é onde entram padrão e limites
//   serialize    transforma o valor em texto para salvar (padrão: String)
// Devolve { get, set, use }. `get`/`set` servem fora de componentes.
export function createStoredPreference(key, { parse, serialize = String }) {
  const listeners = new Set();
  const get = () => parse(storage.get(key));
  const subscribe = (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  };

  return {
    get,
    set(value) {
      storage.set(key, serialize(parse(serialize(value))));
      listeners.forEach((l) => l());
    },
    use: () => useSyncExternalStore(subscribe, get),
  };
}

// Número limitado a [min, max] (padrão `initial`). `change(delta)` soma e respeita os limites.
export function createStoredNumber(key, { initial, min, max }) {
  const clamp = (n) => Math.min(max, Math.max(min, n));
  const pref = createStoredPreference(key, {
    parse: (raw) => {
      const n = parseInt(raw, 10);
      return Number.isFinite(n) ? clamp(n) : initial;
    },
  });
  return { ...pref, change: (delta) => pref.set(pref.get() + delta) };
}
