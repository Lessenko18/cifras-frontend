import { cleanCifraText } from './cleanCifraText';
import { DIM_CHARS, isChordToken } from './chordSyntax';
import { createStoredPreference } from "../lib/storedPreference";

// Escala cromática completa com sustenidos
const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Escala com bemóis (F# mantido: é a grafia usual de Gb/F#)
const CHROMATIC_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

// Preferências de exibição, salvas no aparelho. Os hooks re-renderizam quem os usa; as
// funções abaixo aceitam o valor como argumento (padrão: o salvo) para que as
// dependências de useMemo sejam explícitas: renderCifra(doc, n, { accidental, simplify }).
const accidentalPref = createStoredPreference('acidente', {
  parse: (raw) => (raw === 'flat' ? 'flat' : 'sharp'),
});
export const getAccidental = accidentalPref.get;
export const setAccidental = accidentalPref.set;
export const useAccidental = accidentalPref.use;

// "Cifra simplificada" (N3): reduz cada acorde a maior/menor, sem baixo
const simplifyPref = createStoredPreference('cifraSimples', {
  parse: (raw) => raw === '1',
  serialize: (value) => (value ? '1' : '0'),
});
export const getSimplify = simplifyPref.get;
export const setSimplify = simplifyPref.set;
export const useSimplify = simplifyPref.use;

const scale = (accidental = getAccidental()) => (accidental === 'flat' ? CHROMATIC_FLAT : CHROMATIC);

// Tom em semitons sempre entre -5 e +6 (o caminho mais curto até a nota)
export function wrapSemitones(n) {
  const m = ((Math.trunc(Number(n)) % 12) + 12) % 12;
  return m > 6 ? m - 12 : m;
}

// Mapa de bemóis → sustenido equivalente
const FLAT_TO_SHARP = {
  Db: 'C#', Eb: 'D#', Fb: 'E', Gb: 'F#',
  Ab: 'G#', Bb: 'A#', Cb: 'B',
};

// Ordem de exibição na grade do modal (padrão CifraClub: bemóis, exceto F#)
export const NOTES_DISPLAY = ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab'];

export function toSharp(note) {
  return FLAT_TO_SHARP[note] ?? note;
}

function getNoteIndex(note) {
  return CHROMATIC.indexOf(toSharp(note));
}

export function transposeNote(note, semitones, accidental) {
  const idx = getNoteIndex(note);
  if (idx === -1) return note;
  return scale(accidental)[((idx + semitones) % 12 + 12) % 12];
}

// Uma linha é de acordes se TODOS os tokens forem acordes válidos.
// Parênteses não contam ("D9  ( D4  D )", "(G", "A)"): só envolvem acordes.
function isChordLine(line) {
  const tokens = line
    .trim()
    .split(/\s+/)
    .map((t) => t.replace(/^\(+|\)+$/g, ''))
    .filter(Boolean);
  return tokens.length > 0 && tokens.every(isChordToken);
}

// Regex para encontrar tokens de acorde dentro de uma linha já confirmada como linha de acordes
const CHORD_TOKEN_REGEX = new RegExp(
  String.raw`([A-G][#b]?)(m(?:aj\d*)?|min\d*|dim\d*|aug\d*|sus\d*|add\d*|[${DIM_CHARS}])?\d*M?(sus\d*)?(\/([A-G][#b]?))?`,
  "g",
);

export function transposeLine(line, semitones, accidental) {
  return line.replace(CHORD_TOKEN_REGEX, (match, root, _q, _n, _, bass) => {
    const newRoot = transposeNote(root, semitones, accidental);
    const newBass = bass ? '/' + transposeNote(bass, semitones, accidental) : '';
    return match
      .replace(/^[A-G][#b]?/, newRoot)
      .replace(/\/[A-G][#b]?$/, newBass || '');
  });
}

// Linha "Tom: X" escrita no texto (padrão CifraClub)
export const TOM_LINE_REGEX = /^(Tom:\s*)([A-G][#b]?)(.*)/i;

// C7M → C, F/G → F, Am7 → Am, Dsus4 → D, Bdim → Bm
export function simplifyLine(line) {
  return line.replace(CHORD_TOKEN_REGEX, (match, root, quality) => {
    const minor = quality && new RegExp(`^(m(?!aj)|min|dim|[${DIM_CHARS}])`).test(quality);
    return root + (minor ? 'm' : '');
  });
}

// "[Intro] Bm  D  Bm  A": rótulo de seção + acordes na mesma linha (estilo Cifra Club)
const LABELED_CHORDS_RE = /^(\s*\[[^\]]{1,40}\]\s+)(\S.*)$/;

/**
 * Transpõe todas as linhas de acorde de um texto, preservando letras intactas.
 * Usa sustenido ou bemol na saída, conforme a preferência (getAccidental).
 */
export function transposeText(rawText, semitones, { simplify = getSimplify(), accidental = getAccidental() } = {}) {
  const text = cleanCifraText(rawText);
  if (!text || (semitones === 0 && !simplify)) return text;
  return text
    .split('\n')
    .map((line) => {
      const tomMatch = line.match(TOM_LINE_REGEX);
      if (tomMatch) {
        return tomMatch[1] + transposeNote(tomMatch[2], semitones, accidental) + tomMatch[3];
      }
      // com rótulo na frente, só a parte dos acordes é transposta
      const labeled = line.match(LABELED_CHORDS_RE);
      const [prefix, body] = labeled && isChordLine(labeled[2]) ? [labeled[1], labeled[2]] : ['', line];
      if (!isChordLine(body)) return line;
      const moved = semitones === 0 ? body : transposeLine(body, semitones, accidental);
      return prefix + (simplify ? simplifyLine(moved) : moved);
    })
    .join('\n');
}

/**
 * Detecta a tonalidade original da cifra.
 * Prioriza a linha "Tom: X" escrita no texto (padrão CifraClub).
 * Retorna sempre em sustenido (base interna; a exibição passa por getKeyAtOffset).
 */
export function detectOriginalKey(rawText) {
  const text = cleanCifraText(rawText);
  if (!text) return null;
  for (const line of text.split('\n')) {
    const tomMatch = line.trim().match(TOM_LINE_REGEX);
    if (tomMatch) return toSharp(tomMatch[2]);
  }
  for (const line of text.split('\n')) {
    if (isChordLine(line)) {
      const match = line.trim().match(/^([A-G][#b]?)/);
      if (match) return toSharp(match[1]);
    }
  }
  return null;
}

// "m", "min", "m7"... (menor) x "maj", "M", "7"... (maior); `quality` é o que vem depois da nota
export const isMinorQuality = (quality) => /^(m(?!aj)|min)/.test(quality || '');

/**
 * A tonalidade original é menor? Segue a mesma regra de detectOriginalKey: linha "Tom: Am"
 * se houver; senão o primeiro acorde da cifra.
 */
export function detectOriginalMinor(rawText) {
  const text = cleanCifraText(rawText);
  if (!text) return false;
  const lines = text.split("\n");
  for (const line of lines) {
    const tomMatch = line.trim().match(TOM_LINE_REGEX);
    if (tomMatch) return isMinorQuality(tomMatch[3].trim());
  }
  for (const line of lines) {
    if (isChordLine(line)) {
      const match = line.trim().match(/^\(?[A-G][#b]?(.*)/);
      if (match) return isMinorQuality(match[1]);
    }
  }
  return false;
}

/**
 * Retorna o nome da tonalidade após N semitons, na grafia preferida.
 */
export function getKeyAtOffset(baseKey, semitones, accidental) {
  if (!baseKey) return null;
  const idx = getNoteIndex(baseKey);
  if (idx === -1) return baseKey;
  return scale(accidental)[((idx + semitones) % 12 + 12) % 12];
}

/**
 * Calcula o offset em semitons para atingir uma nota alvo a partir da nota original.
 * Usa o caminho mais curto (máximo de 6 semitons).
 */
export function getSemitonesTo(fromNote, toNote) {
  const from = getNoteIndex(fromNote);
  const to = getNoteIndex(toNote);
  if (from === -1 || to === -1) return 0;
  let diff = (to - from + 12) % 12;
  if (diff > 6) diff -= 12;
  return diff;
}

/**
 * Sugestões de capotraste para tocar com formas fáceis (C, G, D, A, E).
 * `key` é a tonalidade atual (ex.: "Eb"). Retorna até 3 opções, da menor casa
 * para a maior; capo 0 significa tocar sem capo.
 */
export function suggestCapo(key, minor = false) {
  const idx = getNoteIndex(key);
  if (idx === -1) return [];
  // Formas fáceis: C G D A E (maiores) ou Am Em Dm (menores)
  return (minor ? ['A', 'E', 'D'] : ['C', 'G', 'D', 'A', 'E'])
    .map((shape) => ({ shape, label: shape + (minor ? 'm' : ''), capo: (idx - getNoteIndex(shape) + 12) % 12 }))
    .filter((o) => o.capo <= 7)
    .sort((a, b) => a.capo - b.capo)
    .slice(0, 3);
}
