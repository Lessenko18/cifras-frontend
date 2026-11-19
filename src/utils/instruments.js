// Instrumentos do diagrama de acordes. A chave é o que fica salvo em "instrumento".
export const INSTRUMENTS = {
  guitar: "Violão",
  guitarra: "Guitarra",
  baixo: "Baixo",
  piano: "Teclado/Piano",
};

export const INSTRUMENT_OPTIONS = Object.entries(INSTRUMENTS);

export function normalizeInstrument(value) {
  return Object.hasOwn(INSTRUMENTS, value) ? value : "guitar";
}
