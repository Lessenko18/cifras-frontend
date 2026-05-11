const CHORD_RE =
  /^[A-G][b#]?(maj|min|m|dim|aug|sus[24]?|add)?[0-9]*(b[0-9]+|#[0-9]+)?(\/[A-G][b#]?)?[+°]?$/;

const SYMBOL_TOKENS = new Set(["-", "|", "||", "||:", ":||", "/"]);

export function isChord(word) {
  return CHORD_RE.test(word);
}

function isChordLine(line) {
  if (!line.trim()) return false;
  if (/^Tom:/i.test(line.trim())) return false;
  const words = line.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  return (
    words.some((w) => isChord(w)) &&
    words.every((w) => isChord(w) || SYMBOL_TOKENS.has(w))
  );
}

function extractChords(chordLine) {
  const chords = [];
  let i = 0;
  while (i < chordLine.length) {
    if (chordLine[i] !== " ") {
      let j = i;
      while (j < chordLine.length && chordLine[j] !== " ") j++;
      chords.push({ text: chordLine.slice(i, j), pos: i });
      i = j;
    } else {
      i++;
    }
  }
  return chords;
}

function extractWords(lyricLine) {
  const words = [];
  let i = 0;
  while (i < lyricLine.length) {
    if (lyricLine[i] !== " ") {
      let j = i;
      while (j < lyricLine.length && lyricLine[j] !== " ") j++;
      words.push({ start: i, end: j });
      i = j;
    } else {
      i++;
    }
  }
  return words;
}

// Divide uma linha de acordes + linha de letra em tokens por PALAVRA.
// Cada token: { chord, lyric }
// O acorde é atribuído à palavra dentro da qual ele cai (ou à mais próxima).
// Assim flex-wrap quebra entre palavras, nunca no meio delas.
function parseChordLyricPair(chordLine, lyricLine) {
  const chords = extractChords(chordLine);
  const words = extractWords(lyricLine);

  if (words.length === 0) {
    return chords.map((c) => ({ chord: c.text, lyric: "" }));
  }

  // Atribui cada acorde à palavra correta
  const wordChords = new Array(words.length).fill("");

  for (const chord of chords) {
    let target = words.length - 1; // padrão: última palavra

    for (let wi = 0; wi < words.length; wi++) {
      if (chord.pos <= words[wi].start) {
        // Acorde está antes ou no início desta palavra
        target = wi;
        break;
      }
      if (chord.pos < words[wi].end) {
        // Acorde cai dentro desta palavra
        target = wi;
        break;
      }
    }

    wordChords[target] = wordChords[target]
      ? wordChords[target] + " " + chord.text
      : chord.text;
  }

  // Monta tokens: palavra + espaços até a próxima
  const tokens = [];
  for (let wi = 0; wi < words.length; wi++) {
    const { start, end } = words[wi];
    const trailingEnd =
      wi + 1 < words.length ? words[wi + 1].start : lyricLine.length;
    tokens.push({
      chord: wordChords[wi],
      lyric: lyricLine.slice(start, trailingEnd),
    });
  }

  return tokens;
}

export function parseCifraText(text) {
  const lines = (text || "").split("\n");
  const segments = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      segments.push({ type: "blank" });
      i++;
      continue;
    }

    if (isChordLine(line)) {
      const next = lines[i + 1];
      const nextIsLyric =
        next !== undefined && next.trim() !== "" && !isChordLine(next);

      if (nextIsLyric) {
        segments.push({
          type: "chord-lyric",
          tokens: parseChordLyricPair(line, next),
        });
        i += 2;
      } else {
        segments.push({ type: "chord-only", line });
        i++;
      }
    } else {
      segments.push({ type: "plain", line });
      i++;
    }
  }

  return segments;
}
