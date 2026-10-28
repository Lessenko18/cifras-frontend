// A cifra pronta para a tela. Ponto único que recebe a cifra como ela vem da API
// ({ text, chordpro }) e entrega: o que desenhar, o tom, as colunas e o texto do PDF.
//
// - Com `chordpro` (e ele válido): usa o ChordPro. Transpor/simplificar troca os acordes
//   direto nos trechos, sem adivinhar o que é acorde por regex de linha.
// - Sem `chordpro`: caminho antigo, idêntico ao de antes (texto -> transposeText -> parser).
//
// Para voltar tudo ao caminho antigo basta apagar o campo `chordpro` das cifras.

import { parseCifraText } from "./cifraParser";
import { chordProToSegments } from "./chordpro";
import {
  TOM_LINE_REGEX,
  detectOriginalKey,
  getSimplify,
  simplifyLine,
  toSharp,
  transposeLine,
  transposeNote,
  transposeText,
} from "./transpose";

const COLUMN_BREAK = "!!!";

// Primeiro acorde que aparece num trecho (para descobrir o tom)
function firstChordOf(segment) {
  if (segment.type === "chord-lyric") {
    const token = segment.tokens.find((t) => t.chord);
    return token ? token.chord.split(" ")[0] : null;
  }
  if (segment.type === "chord-only") {
    const m = segment.line.trim().match(/^\(?([A-G][#b]?)/);
    return m ? m[1] : null;
  }
  return null;
}

/**
 * Tom original: linha "Tom: X" se houver; senão o primeiro acorde da cifra.
 * Enquanto a API mandar o texto original junto, o tom sai dele: assim ele é IGUAL ao
 * de antes em todas as cifras (a detecção pelo ChordPro pegaria também os acordes da
 * Intro e mudaria o tom exibido em algumas).
 */
export function detectKey({ text, chordpro } = {}) {
  if (text || !chordpro) return detectOriginalKey(text);

  const segments = chordProToSegments(chordpro);
  for (const s of segments) {
    if (s.type !== "plain") continue;
    const m = s.line.trim().match(TOM_LINE_REGEX);
    if (m) return toSharp(m[2]);
  }
  for (const s of segments) {
    const chord = firstChordOf(s);
    const root = chord?.match(/^\(?([A-G][#b]?)/)?.[1];
    if (root) return toSharp(root);
  }
  return null;
}

/** Transpõe (e, se a preferência estiver ligada, simplifica) trechos já montados. */
export function transposeSegments(segments, semitones) {
  const simplify = getSimplify();
  if (semitones === 0 && !simplify) return segments;

  const fix = (chordText) => {
    const moved = semitones === 0 ? chordText : transposeLine(chordText, semitones);
    return simplify ? simplifyLine(moved) : moved;
  };

  return segments.map((s) => {
    if (s.type === "chord-lyric") {
      return { ...s, tokens: s.tokens.map((t) => (t.chord ? { ...t, chord: fix(t.chord) } : t)) };
    }
    if (s.type === "chord-only") return { ...s, line: fix(s.line) };
    if (s.type === "plain") {
      const m = s.line.match(TOM_LINE_REGEX);
      if (m) return { ...s, line: m[1] + transposeNote(m[2], semitones) + m[3] };
    }
    return s;
  });
}

const isColumnBreak = (s) => s.type === "plain" && s.line.includes(COLUMN_BREAK);

/** Divide em colunas nos separadores "!!!" (se não houver, uma coluna só). */
export function splitColumns(segments) {
  const columns = [[]];
  for (const s of segments) {
    if (isColumnBreak(s)) columns.push([]);
    else columns[columns.length - 1].push(s);
  }
  return columns.filter((c) => c.length > 0);
}

/** Texto em duas linhas (acordes em cima, letra embaixo) a partir dos trechos. Para o PDF. */
export function segmentsToText(segments) {
  const out = [];
  for (const s of segments) {
    if (s.type === "blank") {
      out.push("");
    } else if (s.type === "chord-lyric") {
      let lyric = "";
      let chords = "";
      for (const t of s.tokens) {
        if (t.chord) {
          const col = Math.max(lyric.length, chords.length ? chords.length + 1 : 0);
          chords += " ".repeat(col - chords.length) + t.chord;
        }
        lyric += t.lyric;
      }
      if (chords.trim()) out.push(chords);
      out.push(lyric);
    } else {
      out.push(s.line);
    }
  }
  return out.join("\n");
}

/**
 * A cifra pronta para a tela, já transposta.
 * -> { segments, columns, text }
 *    segments: tudo, para desenhar; columns: separado nos "!!!"; text: duas linhas, para PDF.
 */
export function renderCifra({ text, chordpro } = {}, semitones = 0) {
  if (!chordpro) {
    // caminho antigo, igual ao de antes: transpõe o texto e divide nos "!!!" como string
    const transposed = transposeText(text || "", semitones);
    const parts = transposed.split(COLUMN_BREAK);
    const joined = parts.filter(Boolean).join("\n\n");
    return {
      segments: parseCifraText(joined),
      columns: parts.filter((p) => p.trim()).map((p) => parseCifraText(p)),
      text: joined,
    };
  }

  const segments = transposeSegments(chordProToSegments(chordpro), semitones);
  const columns = splitColumns(segments);
  // Entre colunas, 3 linhas em branco: é o espaçamento que o caminho antigo sempre teve
  const gap = [{ type: "blank" }, { type: "blank" }, { type: "blank" }];
  const flat =
    columns.length > 1
      ? columns.flatMap((c, i) => (i === 0 ? c : [...gap, ...c]))
      : segments.filter((s) => !isColumnBreak(s));

  return { segments: flat, columns, text: segmentsToText(flat) };
}

/** A cifra tem separador de colunas ("!!!")? */
export function hasColumns({ text, chordpro } = {}) {
  return chordpro ? chordpro.includes(COLUMN_BREAK) : String(text || "").includes(COLUMN_BREAK);
}
