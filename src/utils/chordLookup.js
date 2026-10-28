// Converte o nome de um acorde da cifra ("F#m7", "C7M", "Am/C") na chave/sufixo
// usados pelo @tombatossals/chords-db.
import { get as getTonalChord } from "@tonaljs/chord";

const KEY_ALIAS = {
  guitar: { "C#": "Csharp", Db: "Csharp", "D#": "Eb", "F#": "Fsharp", Gb: "Fsharp", "G#": "Ab", "A#": "Bb" },
};

function normalizeSuffix(raw) {
  let s = raw.replace(/[()]/g, "");
  if (s === "") return "major";
  s = s.replace(/^m7M|^mM7|^mmaj7/, "mmaj7");
  s = s.replace(/^min/, "m").replace(/^maj7|^M7|^7M|^7\+/, "maj7");
  if (s === "sus") s = "sus4";
  if (s === "m") return "minor";
  if (s === "°") return "dim";
  if (s === "+") return "aug";
  return s;
}

export function parseChord(name) {
  const m = String(name).trim().match(/^\(?([A-G][#b]?)([^/]*)(?:\/([A-G][#b]?))?\)?$/);
  if (!m) return null;
  return { root: m[1], suffix: normalizeSuffix(m[2]), bass: m[3] || null };
}

// Retorna { key, suffix, positions } ou null se o acorde não existir no banco.
export function findChord(data, instrument, name) {
  const parsed = parseChord(name);
  if (!parsed) return null;
  const key = KEY_ALIAS[instrument]?.[parsed.root] ?? parsed.root;
  const list = data.chords[key];
  if (!list) return null;

  // Inversões no banco: "/E" (maior) e "m/B" (menor)
  let withBass = null;
  if (parsed.bass && (parsed.suffix === "major" || parsed.suffix === "minor")) {
    const inv = `${parsed.suffix === "minor" ? "m" : ""}/${parsed.bass}`;
    withBass = list.find((c) => c.suffix === inv);
  }
  const found = withBass || list.find((c) => c.suffix === parsed.suffix);
  return found ? { ...found, key } : null;
}

// ---- Teclado/piano: o banco não tem teclado, então as notas saem da fórmula do acorde ----
const PC = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
const NAMES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NAMES_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

// intervalos em semitons a partir da fundamental (nomes iguais aos do chords-db)
const FORMULAS = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  dim: [0, 3, 6],
  dim7: [0, 3, 6, 9],
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  "7sus4": [0, 5, 7, 10],
  6: [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
  69: [0, 4, 7, 9, 14],
  7: [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  m7b5: [0, 3, 6, 10],
  mmaj7: [0, 3, 7, 11],
  aug7: [0, 4, 8, 10],
  "7b5": [0, 4, 6, 10],
  "7b9": [0, 4, 7, 10, 13],
  "7#9": [0, 4, 7, 10, 15],
  9: [0, 4, 7, 10, 14],
  maj9: [0, 4, 7, 11, 14],
  m9: [0, 3, 7, 10, 14],
  11: [0, 4, 7, 10, 14, 17],
  m11: [0, 3, 7, 10, 14, 17],
  13: [0, 4, 7, 10, 14, 21],
  maj13: [0, 4, 7, 11, 14, 21],
  add9: [0, 4, 7, 14],
  madd9: [0, 3, 7, 14],
};

// Fallback: acordes que a tabela acima não cobre (ex.: C13b9, Cmaj9#11) vêm da biblioteca tonal.
const LETTER = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function pitchClass(note) {
  const m = /^([A-G])(#{0,2}|b{0,2})$/.exec(note);
  if (!m) return null;
  const acc = m[2].startsWith("#") ? m[2].length : -m[2].length;
  return (((LETTER[m[1]] + acc) % 12) + 12) % 12;
}

function tonalFormula(name) {
  const clean = String(name).trim().replace(/[()]/g, "").replace(/(\d)?M(\d)/, "maj$2");
  const chord = getTonalChord(clean);
  if (chord.empty || !chord.tonic) return null;
  const root = pitchClass(chord.tonic);
  // intervalos acumulados a partir da fundamental, sempre subindo
  let prev = root;
  const formula = chord.notes.map((n) => {
    let pc = pitchClass(n);
    if (pc === null) return null;
    while (pc < prev) pc += 12;
    prev = pc;
    return pc - root;
  });
  return formula.includes(null) ? null : { root, formula };
}

// Monta as posições no teclado: fundamental + inversões (a nota mais grave sobe uma oitava).
// Cada posição: { label, keys: [0..35], names: { tecla: "F#" } }.
const INVERSION_LABELS = ["Posição fundamental", "1ª inversão", "2ª inversão", "3ª inversão", "4ª inversão", "5ª inversão"];

function buildVoicings(base, bassPc, names) {
  const label = (key) => names[key % 12];
  const make = (keys, text) => {
    const shift = 12 * Math.floor(Math.min(...keys) / 12);
    const norm = keys.map((k) => k - shift);
    if (Math.max(...norm) > 35) return null;
    return { label: text, keys: norm, names: Object.fromEntries(norm.map((k) => [k, label(k)])) };
  };

  // acorde com baixo escrito (C/E): uma posição só, com o baixo na nota mais grave
  if (bassPc !== null) {
    const v = make([bassPc, ...base.map((k) => k + 12)], "Com baixo");
    return v ? [v] : [];
  }
  return base
    .map((_, i) => make([...base.slice(i), ...base.slice(0, i).map((k) => k + 12)], INVERSION_LABELS[i]))
    .filter(Boolean)
    .slice(0, 4); // fundamental + até 3 inversões
}

// Retorna { notes, voicings } ou null. `flat` escolhe a grafia (♭ ou ♯) dos nomes das notas.
export function chordNotes(name, flat = false) {
  const parsed = parseChord(name);
  if (!parsed) return null;

  let root = PC[parsed.root];
  let formula = FORMULAS[parsed.suffix];
  if (root === undefined || !formula) {
    const t = tonalFormula(name);
    if (!t) return null;
    ({ root, formula } = t);
  }

  const names = flat ? NAMES_FLAT : NAMES_SHARP;
  const base = formula.map((i) => root + i);
  const bassPc = parsed.bass && PC[parsed.bass] !== undefined ? PC[parsed.bass] : null;
  const voicings = buildVoicings(base, bassPc, names);
  if (!voicings.length) return null;

  const notes = [...new Set([...(bassPc !== null ? [names[bassPc]] : []), ...base.map((k) => names[k % 12])])];
  return { notes, voicings };
}
