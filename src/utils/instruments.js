// Instrumentos do diagrama de acordes. A chave é o que fica salvo em "instrumento".
export const INSTRUMENTS = {
  guitar: "Violão",
  guitarra: "Guitarra",
  baixo: "Baixo",
  piano: "Teclado/Piano",
};

export const INSTRUMENT_OPTIONS = Object.entries(INSTRUMENTS);

// "instrumento" guarda uma lista separada por vírgula (ex.: "guitar,piano").
// Valores antigos (um só instrumento) continuam válidos.
export function parseInstruments(raw) {
  const list = String(raw ?? "")
    .split(",")
    .filter((v) => Object.hasOwn(INSTRUMENTS, v));
  return list.length ? [...new Set(list)] : ["guitar"];
}

// Instrumento principal (o primeiro da lista): abre no diagrama de acordes.
export function normalizeInstrument(value) {
  return parseInstruments(value)[0];
}
