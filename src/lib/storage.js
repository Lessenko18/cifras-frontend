// Único ponto de acesso ao localStorage do app.
//
// Nunca lança: em aba anônima, com cookies/dados de site bloqueados ou com a cota
// cheia, o navegador pode jogar exceção em qualquer leitura/escrita. Aqui isso vira
// "sem valor" (get) ou `false` (set), e o app segue funcionando sem lembrar nada.
//
// Chaves usadas hoje (mantenha esta lista atualizada ao criar uma nova):
//   access_token, user ........ sessão (limpas no logout)
//   theme ..................... "light" | "dark" (ausente = segue o sistema)
//   acidente, cifraSimples .... preferências de exibição da cifra
//   instrumento ............... "guitar" | "piano" (diagrama de acordes)
//   onboarding_v1 ............. boas-vindas já vistas
//   cifra_fontSize, stage_* ... tamanho da fonte e preferências do modo palco
//   tom_<cifraId> ............. transposição escolhida numa cifra neste aparelho
//   nota_<cifraId> ............ anotação pessoal da cifra
//   cifras_recentes ........... últimas cifras abertas
//   offline_playlist_<id> ..... cópia offline de uma playlist (apagada no logout)
//
// Quando as preferências forem para a conta do usuário (servidor), é só trocar a
// implementação daqui: os chamadores não mudam.

export const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, String(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // nada a fazer
    }
  },

  // JSON com fallback: valor ausente ou corrompido devolve `fallback`.
  getJSON(key, fallback = null) {
    const raw = storage.get(key);
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  setJSON(key, value) {
    return storage.set(key, JSON.stringify(value));
  },

  // Todas as chaves que começam com `prefix` (ex.: "offline_playlist_").
  keysWithPrefix(prefix) {
    try {
      return Object.keys(localStorage).filter((k) => k.startsWith(prefix));
    } catch {
      return [];
    }
  },

  removeWithPrefix(prefix) {
    storage.keysWithPrefix(prefix).forEach((k) => storage.remove(k));
  },
};
