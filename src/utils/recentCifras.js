// Últimas cifras abertas, guardadas só neste aparelho (para "Recentes" na Home).
const KEY = "cifras_recentes";
const MAX = 6;

export function getRecentCifras() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(list) ? list.filter((c) => c?.id && c?.nome).slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function pushRecentCifra({ id, nome, artista }) {
  if (!id || !nome) return;
  try {
    const rest = getRecentCifras().filter((c) => c.id !== String(id));
    localStorage.setItem(KEY, JSON.stringify([{ id: String(id), nome, artista: artista || "" }, ...rest].slice(0, MAX)));
  } catch {
    // sem storage: só deixa de lembrar
  }
}
