// Escala cromática completa com sustenidos
const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Mapa de bemóis → sustenido equivalente
const FLAT_TO_SHARP = {
  Db: 'C#', Eb: 'D#', Fb: 'E', Gb: 'F#',
  Ab: 'G#', Bb: 'A#', Cb: 'B',
};

// Escala exportada para o componente (lookup)
export const NOTES = CHROMATIC;

// Ordem de exibição na grade do modal (padrão CifraClub: bemóis, exceto F#)
export const NOTES_DISPLAY = ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab'];

function toSharp(note) {
  return FLAT_TO_SHARP[note] ?? note;
}

function getNoteIndex(note) {
  return CHROMATIC.indexOf(toSharp(note));
}

function transposeNote(note, semitones) {
  const idx = getNoteIndex(note);
  if (idx === -1) return note;
  return CHROMATIC[((idx + semitones) % 12 + 12) % 12];
}

// Padrão de acorde: Am, G7, F#m7, Bb, C/E, Dm7sus4, Cmaj7, Asus2, etc.
const CHORD_PATTERN =
  /^[A-G][#b]?(m(?:aj\d*)?|min\d*|dim\d*|aug\d*|sus\d*|add\d*)?\d*(sus\d*)?(\/[A-G][#b]?)?$/;

function isChord(token) {
  return CHORD_PATTERN.test(token);
}

// Uma linha é de acordes se TODOS os tokens forem acordes válidos
function isChordLine(line) {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  return tokens.length > 0 && tokens.every(isChord);
}

// Regex para encontrar tokens de acorde dentro de uma linha já confirmada como linha de acordes
const CHORD_TOKEN_REGEX =
  /([A-G][#b]?)(m(?:aj\d*)?|min\d*|dim\d*|aug\d*|sus\d*|add\d*)?\d*(sus\d*)?(\/([A-G][#b]?))?/g;

function transposeLine(line, semitones) {
  return line.replace(CHORD_TOKEN_REGEX, (match, root, _q, _n, _, bass) => {
    const newRoot = transposeNote(root, semitones);
    const newBass = bass ? '/' + transposeNote(bass, semitones) : '';
    return match
      .replace(/^[A-G][#b]?/, newRoot)
      .replace(/\/[A-G][#b]?$/, newBass || '');
  });
}

// Linha "Tom: X" escrita no texto (padrão CifraClub)
const TOM_LINE_REGEX = /^(Tom:\s*)([A-G][#b]?)(.*)/i;

/**
 * Transpõe todas as linhas de acorde de um texto, preservando letras intactas.
 * Sempre usa sustenidos (#) na saída.
 */
export function transposeText(text, semitones) {
  if (!text || semitones === 0) return text;
  return text
    .split('\n')
    .map((line) => {
      const tomMatch = line.match(TOM_LINE_REGEX);
      if (tomMatch) {
        return tomMatch[1] + transposeNote(tomMatch[2], semitones) + tomMatch[3];
      }
      if (isChordLine(line)) return transposeLine(line, semitones);
      return line;
    })
    .join('\n');
}

/**
 * Detecta a tonalidade original da cifra.
 * Prioriza a linha "Tom: X" escrita no texto (padrão CifraClub).
 * Retorna sempre em sustenido.
 */
export function detectOriginalKey(text) {
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
 * Retorna o nome da tonalidade após N semitons (sempre em sustenido).
 */
export function getKeyAtOffset(baseKey, semitones) {
  if (!baseKey) return null;
  const idx = getNoteIndex(baseKey);
  if (idx === -1) return baseKey;
  return CHROMATIC[((idx + semitones) % 12 + 12) % 12];
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
