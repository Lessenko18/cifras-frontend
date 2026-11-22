// Destaque do trecho encontrado na busca. Ignora acento e caixa, como a busca do servidor:
// digitar "coracao" destaca "Coração". Cada palavra digitada é destacada onde aparecer.

// Letra "limpa" (sem acento, minúscula). Uma letra pode virar 0 ou 2+ caracteres; o mapa
// `origin` guarda de qual posição do texto original cada caractere limpo veio.
function fold(text) {
  let folded = "";
  const origin = [];
  Array.from(String(text ?? "")).reduce((index, char) => {
    const clean = char.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    for (let i = 0; i < clean.length; i++) origin.push(index);
    folded += clean;
    return index + char.length;
  }, 0);
  return { folded, origin };
}

export function searchTerms(query) {
  return fold(query)
    .folded.split(/\s+/)
    .filter(Boolean)
    .slice(0, 6);
}

/**
 * Divide `text` em trechos [{ text, match }] marcando onde `query` aparece.
 * Sem busca (ou sem ocorrência) devolve um único trecho sem destaque.
 */
export function splitHighlight(text, query) {
  const value = String(text ?? "");
  const terms = searchTerms(query);
  if (!value || terms.length === 0) return [{ text: value, match: false }];

  const { folded, origin } = fold(value);
  const marked = new Array(value.length).fill(false);
  for (const term of terms) {
    let at = folded.indexOf(term);
    while (at !== -1) {
      const from = origin[at];
      const to = (origin[at + term.length - 1] ?? value.length - 1) + 1;
      for (let i = from; i < Math.max(to, from + 1); i++) marked[i] = true;
      at = folded.indexOf(term, at + term.length);
    }
  }

  const parts = [];
  for (let i = 0; i < value.length; i++) {
    const last = parts[parts.length - 1];
    if (last && last.match === marked[i]) last.text += value[i];
    else parts.push({ text: value[i], match: marked[i] });
  }
  return parts;
}
