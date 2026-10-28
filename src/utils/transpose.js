import { useSyncExternalStore } from 'react';
import { cleanCifraText } from './cleanCifraText';
import { storage } from "../lib/storage";

// Escala cromática completa com sustenidos
const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Escala com bemóis (F# mantido: é a grafia usual de Gb/F#)
const CHROMATIC_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

// Preferência de grafia (sustenido x bemol), salva no aparelho
const ACCIDENTAL_KEY = 'acidente';
const listeners = new Set();

export function getAccidental() {
  try {
    return storage.get(ACCIDENTAL_KEY) === 'flat' ? 'flat' : 'sharp';
  } catch {
    return 'sharp';
  }
}

export function setAccidental(value) {
  try {
    storage.set(ACCIDENTAL_KEY, value === 'flat' ? 'flat' : 'sharp');
  } catch {
    // sem storage: a preferência só vale até recarregar
  }
  listeners.forEach((l) => l());
}

// Hook: re-renderiza quem usa a transposição quando a preferência muda.
// Inclua o valor retornado nas dependências de useMemo que chamam transposeText.
export function useAccidental() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getAccidental,
  );
}

// Preferência "cifra simplificada" (N3): reduz cada acorde a maior/menor, sem baixo
const SIMPLIFY_KEY = 'cifraSimples';

export function getSimplify() {
  try {
    return storage.get(SIMPLIFY_KEY) === '1';
  } catch {
    return false;
  }
}

export function setSimplify(value) {
  try {
    storage.set(SIMPLIFY_KEY, value ? '1' : '0');
  } catch {
    // sem storage: vale só até recarregar
  }
  listeners.forEach((l) => l());
}

export function useSimplify() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getSimplify,
  );
}

const scale = () => (getAccidental() === 'flat' ? CHROMATIC_FLAT : CHROMATIC);

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

export function transposeNote(note, semitones) {
  const idx = getNoteIndex(note);
  if (idx === -1) return note;
  return scale()[((idx + semitones) % 12 + 12) % 12];
}

// Padrão de acorde: Am, G7, F#m7, Bb, C/E, Dm7sus4, Cmaj7, Asus2, etc.
const CHORD_PATTERN =
  /^[A-G][#b]?(m(?:aj\d*)?|min\d*|dim\d*|aug\d*|sus\d*|add\d*)?\d*M?(sus\d*)?(\/[A-G][#b]?)?$/;

// Aceita acordes colados após um baixo (ex: "E/GF#m7" = "E/G" + "F#m7")
function isChord(token) {
  return token.split(/(?<=\/[A-G][#b]?)(?=[A-G])/).every((t) => CHORD_PATTERN.test(t));
}

// Uma linha é de acordes se TODOS os tokens forem acordes válidos
function isChordLine(line) {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  return tokens.length > 0 && tokens.every(isChord);
}

// Regex para encontrar tokens de acorde dentro de uma linha já confirmada como linha de acordes
const CHORD_TOKEN_REGEX =
  /([A-G][#b]?)(m(?:aj\d*)?|min\d*|dim\d*|aug\d*|sus\d*|add\d*)?\d*M?(sus\d*)?(\/([A-G][#b]?))?/g;

export function transposeLine(line, semitones) {
  return line.replace(CHORD_TOKEN_REGEX, (match, root, _q, _n, _, bass) => {
    const newRoot = transposeNote(root, semitones);
    const newBass = bass ? '/' + transposeNote(bass, semitones) : '';
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
    const minor = quality && /^(m(?!aj)|min|dim)/.test(quality);
    return root + (minor ? 'm' : '');
  });
}

// "[Intro] Bm  D  Bm  A": rótulo de seção + acordes na mesma linha (estilo Cifra Club)
const LABELED_CHORDS_RE = /^(\s*\[[^\]]{1,40}\]\s+)(\S.*)$/;

/**
 * Transpõe todas as linhas de acorde de um texto, preservando letras intactas.
 * Usa sustenido ou bemol na saída, conforme a preferência (getAccidental).
 */
export function transposeText(rawText, semitones) {
  const text = cleanCifraText(rawText);
  const simplify = getSimplify();
  if (!text || (semitones === 0 && !simplify)) return text;
  return text
    .split('\n')
    .map((line) => {
      const tomMatch = line.match(TOM_LINE_REGEX);
      if (tomMatch) {
        return tomMatch[1] + transposeNote(tomMatch[2], semitones) + tomMatch[3];
      }
      // com rótulo na frente, só a parte dos acordes é transposta
      const labeled = line.match(LABELED_CHORDS_RE);
      const [prefix, body] = labeled && isChordLine(labeled[2]) ? [labeled[1], labeled[2]] : ['', line];
      if (!isChordLine(body)) return line;
      const moved = semitones === 0 ? body : transposeLine(body, semitones);
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

/**
 * Retorna o nome da tonalidade após N semitons, na grafia preferida.
 */
export function getKeyAtOffset(baseKey, semitones) {
  if (!baseKey) return null;
  const idx = getNoteIndex(baseKey);
  if (idx === -1) return baseKey;
  return scale()[((idx + semitones) % 12 + 12) % 12];
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
export function suggestCapo(key) {
  const idx = getNoteIndex(key);
  if (idx === -1) return [];
  return ['C', 'G', 'D', 'A', 'E']
    .map((shape) => ({ shape, capo: (idx - getNoteIndex(shape) + 12) % 12 }))
    .filter((o) => o.capo <= 7)
    .sort((a, b) => a.capo - b.capo)
    .slice(0, 3);
}
