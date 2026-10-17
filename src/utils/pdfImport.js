import { isChordLine } from "./cifraParser.js";

// ---------------------------------------------------------------------------
// Leitura do PDF (navegador)
// ---------------------------------------------------------------------------

// Lê o PDF no navegador e devolve, por página, os pedaços de texto com posição.
// pdfjs-dist é carregado só aqui para não pesar no bundle principal.
export async function readPdfPages(file) {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;

  const pages = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const content = await page.getTextContent();
    pages.push(toRawItems(content.items));
  }
  return pages;
}

function toRawItems(items) {
  return items
    .filter((it) => typeof it.str === "string" && it.str.trim() !== "")
    .map((it) => ({
      str: it.str,
      x: it.transform[4],
      y: it.transform[5],
      w: it.width,
      h: Math.abs(it.transform[3]) || it.height || 0,
    }));
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

export function normalize(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function median(nums, fallback = 0) {
  if (!nums.length) return fallback;
  const s = [...nums].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

const SMALL_WORDS = new Set(["de", "da", "do", "dos", "das", "e", "a", "o", "em", "no", "na", "para", "por", "com"]);

// "MUITOS GRÃOS DE TRIGO" -> "Muitos Grãos de Trigo". Só mexe em texto todo em maiúsculas.
function titleCase(s) {
  const t = s.trim();
  if (t !== t.toUpperCase() || t === t.toLowerCase()) return t;
  return t
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) => (i > 0 && SMALL_WORDS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

// ---------------------------------------------------------------------------
// Linhas e posição das letras
// ---------------------------------------------------------------------------

// Agrupa os pedaços de texto que estão na mesma altura em linhas (de cima p/ baixo).
function groupLines(items) {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines = [];
  for (const it of sorted) {
    const cur = lines[lines.length - 1];
    if (cur && Math.abs(cur.y - it.y) <= 0.35 * Math.max(cur.h, it.h, 1)) {
      cur.items.push(it);
    } else {
      lines.push({ y: it.y, h: it.h, items: [it] });
    }
  }
  for (const l of lines) {
    l.items.sort((a, b) => a.x - b.x);
    // tamanho da fonte da linha = o do trecho com mais caracteres
    const main = l.items.reduce((best, it) => (it.str.length > best.str.length ? it : best), l.items[0]);
    l.h = main.h;
    l.y = main.y;
  }
  return lines;
}

// Monta o texto da linha preenchendo os espaços pela distância entre os trechos
// e guarda a posição x de cada caractere (necessário p/ fontes não monoespaçadas).
function layoutLine(line) {
  const totalChars = line.items.reduce((n, it) => n + it.str.trim().length, 0) || 1;
  const totalW = line.items.reduce((n, it) => n + it.w, 0);
  const charW = Math.max(totalW / totalChars, line.h * 0.3, 1);

  let text = "";
  const xs = [];
  let prevEnd = null;

  for (const raw of line.items) {
    const len = raw.str.length || 1;
    const per = raw.w / len;
    const lead = raw.str.length - raw.str.trimStart().length;
    const str = raw.str.trim();
    const x = raw.x + lead * per;
    const w = str.length * per;

    if (prevEnd !== null) {
      const gap = x - prevEnd;
      const n = gap > 0.15 * raw.h ? Math.max(1, Math.round(gap / charW)) : 0;
      for (let k = 0; k < n; k++) {
        text += " ";
        xs.push(prevEnd + k * charW);
      }
    }
    for (let j = 0; j < str.length; j++) {
      text += str[j];
      xs.push(x + j * per);
    }
    prevEnd = x + w;
  }

  return { text, xs, x0: line.items[0].x, x1: prevEnd ?? line.items[0].x, charW };
}

// Cada acorde da linha com a posição x onde ele começa.
function chordTokens(line) {
  const tokens = [];
  for (const it of line.items) {
    const per = it.w / (it.str.length || 1);
    for (const m of it.str.matchAll(/\S+/g)) {
      tokens.push({ str: m[0], x: it.x + m.index * per });
    }
  }
  return tokens.sort((a, b) => a.x - b.x);
}

const JUNK_LINE = [
  /^\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}/, // data/hora do cabeçalho de impressão
  /^about:blank/i,
  /^https?:\/\//i,
  /^\d+\s*\/\s*\d+$/, // 1/2
  /^@[\w.]+$/, // @perfil do instagram no rodapé
];

// ---------------------------------------------------------------------------
// Uma página -> texto da cifra
// ---------------------------------------------------------------------------

const LARGE_RATIO = 1.2;

function processPage(items) {
  const all = groupLines(items).map((l) => ({ ...l, ...layoutLine(l) }));
  const lines = all.filter((l) => !JUNK_LINE.some((re) => re.test(l.text.trim())));

  const result = {
    empty: lines.length === 0,
    texts: lines.map((l) => l.text.trim()),
    header: null,
    tom: "",
    rows: [],
    firstText: "",
  };
  if (!lines.length) return result;

  // tamanho "normal" de fonte da página (mediana ponderada pelos caracteres)
  const sizes = [];
  for (const l of lines) for (let i = 0; i < Math.min(l.text.length, 60); i++) sizes.push(l.h);
  const body = median(sizes, 12);

  const isChord = (l) => isChordLine(l.text);
  let i = 0;

  // título grande no topo (CifraClub e prints de "Músicas para Missa")
  const large = [];
  while (i < lines.length && large.length < 4 && lines[i].h >= body * LARGE_RATIO && !isChord(lines[i])) {
    large.push(lines[i].text.trim());
    i++;
  }
  if (large.length === 1) {
    result.header = { titulo: large[0], artista: "" };
  } else if (large.length > 1) {
    result.header = { titulo: large.slice(0, -1).join(" "), artista: large[large.length - 1] };
  }

  // linhas de metadados: Composição / Tom / Afinação
  const rest = [];
  let metaBudget = result.header ? 8 : 0;
  for (; i < lines.length; i++) {
    const t = lines[i].text.trim();
    const tom = t.match(/^Tom:\s*(\S+)/i);
    if (metaBudget > 0 && (tom || /^(Composi[çc][ãa]o|Afina[çc][ãa]o)/i.test(t))) {
      if (tom) result.tom = tom[1];
      metaBudget--;
      continue;
    }
    if (/^Composi[çc][ãa]o\s*(de)?:/i.test(t)) continue; // rodapé de letras.mus.br etc.
    rest.push(lines[i]);
  }
  if (!rest.length) return result;

  result.firstText = rest[0].text.trim();

  const pageLeft = Math.min(...rest.map((l) => l.x0));
  const dys = [];
  for (let k = 1; k < rest.length; k++) dys.push(rest[k - 1].y - rest[k].y);
  const medianDy = median(dys, body * 1.4) || body * 1.4;
  const gridW = median(
    rest.filter(isChord).flatMap((l) => l.items.map((it) => it.w / (it.str.length || 1))),
    median(rest.map((l) => l.charW), 6),
  );

  const rows = [];
  let lastY = null;
  const pushBlankIfGap = (topY) => {
    if (lastY !== null && lastY - topY > 1.5 * medianDy && rows[rows.length - 1] !== "") rows.push("");
  };

  for (let k = 0; k < rest.length; k++) {
    const line = rest[k];
    pushBlankIfGap(line.y);

    if (isChord(line)) {
      const next = rest[k + 1];
      const tokens = chordTokens(line);
      if (next && !isChord(next) && line.y - next.y < 1.5 * medianDy) {
        const indent = Math.max(0, Math.round((next.x0 - pageLeft) / next.charW));
        let out = "";
        for (const t of tokens) {
          let col;
          if (t.x < next.x0 - 0.5 * next.charW) {
            col = Math.round((t.x - pageLeft) / gridW);
          } else if (t.x > next.x1 + 0.3 * next.charW) {
            col = indent + next.text.length + Math.round((t.x - next.x1) / next.charW);
          } else {
            let idx = 0;
            for (let c = 0; c < next.xs.length; c++) {
              if (next.xs[c] <= t.x + 0.3 * next.charW) idx = c;
              else break;
            }
            col = indent + idx;
          }
          col = Math.max(col, out.length ? out.length + 1 : 0);
          out = out.padEnd(col) + t.str;
        }
        rows.push(out, " ".repeat(indent) + next.text);
        lastY = next.y;
        k++;
        continue;
      }
      // acordes sem letra embaixo (intro, ou letra na próxima página)
      let out = "";
      for (const t of tokens) {
        const col = Math.max(Math.round((t.x - pageLeft) / gridW), out.length ? out.length + 1 : 0);
        out = out.padEnd(col) + t.str;
      }
      rows.push(out);
      lastY = line.y;
      continue;
    }

    const indent = Math.max(0, Math.round((line.x0 - pageLeft) / line.charW));
    rows.push(" ".repeat(indent) + line.text);
    lastY = line.y;
  }

  result.rows = rows;
  return result;
}

// ---------------------------------------------------------------------------
// Índice da missa (página "ENTRADA: Fulano", "COMUNHÃO: Beltrano"...)
// ---------------------------------------------------------------------------

function stripUrl(s) {
  return s.replace(/https?:\/\/\S+/gi, "").replace(/[\s:–-]+$/, "").trim();
}

function parseIndexPage(texts) {
  const entries = [];
  for (const raw of texts) {
    const bullet = /^\s*[•·]/.test(raw);
    const t = raw.replace(/^[•·\-–\s]+/, "");
    const m = t.match(/^([^:]{3,40}):\s*(.*)$/);
    if (!m) continue;
    const label = m[1].trim();
    if (label === label.toUpperCase() && /[A-ZÀ-Ú]/.test(label)) {
      entries.push({ label, title: stripUrl(m[2]) });
    } else if (bullet && entries.length) {
      // "• Título: link" sem rótulo: é mais uma música do mesmo momento da linha de cima
      entries.push({ label: entries[entries.length - 1].label, title: stripUrl(t) });
    }
  }
  return entries.length >= 3 ? entries : null;
}

// momento da missa (normalizado) -> nome da categoria no app. A ordem importa.
const LABEL_ALIASES = [
  [/\bespirito santo\b/, "Espírito Santo"],
  [/\b(pos comunhao|acao de gracas)\b/, "Pós-Comunhão"],
  [/\bcomunhao\b/, "Comunhão"],
  [/\b(ato penitencial|penitencial|perdao|piedade)\b/, "Perdão"],
  [/\bentrada\b/, "Entrada"],
  [/\bgloria\b/, "Glória"],
  [/\bsalmo\b/, "Salmo"],
  [/\b(aclamacao|aleluia)\b/, "Aclamação"],
  [/\b(ofertorio|oferendas|apresentacao dos dons)\b/, "Ofertório"],
  [/\bsanto\b/, "Santo"],
  [/\bcordeiro\b/, "Cordeiro"],
  [/\b(final|despedida)\b/, "Final"],
  [/\baspersao\b/, "Aspersão"],
  [/\badoracao\b/, "Adoração"],
  [/\bmaria\b/, "Maria"],
];

// partes fixas da missa que dá pra deduzir só pelo título da música
const TITLE_ALIASES = [
  [/^santo( santo santo)?$/, "Santo"],
  [/^gloria\b/, "Glória"],
  [/^cordeiro de deus\b/, "Cordeiro"],
  [/^aleluia\b/, "Aclamação"],
  [/^(salmo|responsorio)\b/, "Salmo"],
  [/^(piedade|senhor tende piedade|kyrie)\b/, "Perdão"],
];

function categoriaIdByName(nome, categorias) {
  const alvo = normalize(nome);
  const found = categorias.filter((c) => normalize(c.nome) === alvo);
  // prefere a subcategoria (tem pai) quando existir uma categoria de mesmo nome sem pai
  return (found.find((c) => c.parent) || found[0])?._id || "";
}

function categoriaFromLabel(label, categorias) {
  const n = normalize(label);
  const hit = LABEL_ALIASES.find(([re]) => re.test(n));
  return hit ? categoriaIdByName(hit[1], categorias) : "";
}

function categoriaFromTitle(nome, categorias) {
  const n = normalize(nome);
  const hit = TITLE_ALIASES.find(([re]) => re.test(n));
  return hit ? categoriaIdByName(hit[1], categorias) : "";
}

const STOP_WORDS = new Set(["de", "da", "do", "dos", "das", "em", "no", "na", "para", "por", "com", "que"]);

const cleanTitle = (e) => normalize(e.title.replace(/\(.*?\)/g, ""));
const significantWords = (s) => normalize(s).split(" ").filter((w) => w.length >= 3 && !STOP_WORDS.has(w));

function matchIndexEntry(song, entries) {
  const nameN = normalize(song.nome);
  const bodyN = normalize(song.texto);

  for (const e of entries) {
    const t = normalize(`${e.label} ${e.title}`);
    const tt = cleanTitle(e);
    if ((nameN.length >= 4 && t.includes(nameN)) || (tt.length >= 4 && nameN.includes(tt))) return e;
  }
  // título do índice abreviado ("Hino Campanha da Fraternidade" x "Hino da Campanha da...")
  const nameWords = new Set(significantWords(song.nome));
  for (const e of entries) {
    const w = significantWords(e.title.replace(/\(.*?\)/g, ""));
    if (w.length >= 2 && w.every((x) => nameWords.has(x))) return e;
  }
  // título do índice nem sempre é o título da cifra (ex.: refrão); procura dentro da letra
  for (const e of entries) {
    const tt = cleanTitle(e);
    if (tt.length >= 8 && bodyN.includes(tt)) return e;
  }
  return null;
}

// Página sem título que já abre com um item do índice (ex.: o refrão do salmo) e que
// ainda não aparece na música anterior: é o começo de outra música.
function findEntryAtTop(rows, entries, cur) {
  const head = normalize(rows.filter((r) => r.trim() && !isChordLine(r)).slice(0, 4).join(" "));
  const curBody = normalize((cur?.rows || []).join(" "));
  return (
    entries.find((e) => {
      const tt = cleanTitle(e);
      return tt.length >= 8 && head.includes(tt) && !curBody.includes(tt);
    }) || null
  );
}

// Primeira linha curta, sem acorde, seguida de linha de acordes: é o nome da música.
function headingFrom(rows, entryTitleN) {
  const i = rows.findIndex((r) => r.trim());
  if (i < 0 || isChordLine(rows[i]) || rows[i].trim().length > 40) return null;
  if (entryTitleN && normalize(rows[i]).includes(entryTitleN)) return null;
  const next = rows.slice(i + 1).find((r) => r.trim());
  return next && isChordLine(next) ? { text: rows[i].trim(), skip: i + 1 } : null;
}

// ---------------------------------------------------------------------------
// Páginas -> músicas
// ---------------------------------------------------------------------------

export function parsePages(pagesItems, categorias = []) {
  const pages = pagesItems.map(processPage);
  const avisos = [];

  let entries = null;
  let indexPage = -1;
  pages.forEach((p, i) => {
    if (entries) return;
    const found = parseIndexPage(p.texts);
    if (found) {
      entries = found;
      indexPage = i;
    }
  });
  const entryText = (entries || []).map((e) => normalize(`${e.label} ${e.title}`));

  const songs = [];
  let cur = null;

  pages.forEach((p, i) => {
    const num = i + 1;
    if (i === indexPage) return;
    if (p.empty) {
      avisos.push(`Página ${num} sem texto (provavelmente é uma imagem): não dá pra importar, cole essa cifra na mão.`);
      cur = null;
      return;
    }
    if (!p.rows.length && !p.header) return;

    let titulo = "";
    let artista = "";
    let rows = p.rows;
    let startsNew = false;

    if (p.header) {
      startsNew = true;
      titulo = titleCase(p.header.titulo);
      artista = p.header.artista;
    } else if (rows.length && !isChordLine(rows[0]) && /^(salmo|responsorio)\b/.test(normalize(p.firstText))) {
      // página que abre com "Salmo ..." ou "Responsório ..." é sempre uma música nova
      startsNew = true;
      titulo = titleCase(p.firstText);
      rows = rows.slice(1);
    } else if (entries && rows.length && !isChordLine(rows[0])) {
      const first = normalize(p.firstText);
      if (first.length >= 4 && entryText.some((t) => t.includes(first))) {
        startsNew = true;
        titulo = titleCase(p.firstText);
        rows = rows.slice(1);
      }
    }

    if (!startsNew && entries && rows.length) {
      const hit = findEntryAtTop(rows, entries, cur);
      if (hit) {
        startsNew = true;
        const h = headingFrom(rows, cleanTitle(hit));
        if (h) {
          titulo = titleCase(h.text);
          rows = rows.slice(h.skip);
        } else {
          titulo = hit.title;
        }
      }
    }

    if (startsNew || !cur) {
      cur = { nome: titulo || `Sem título (pág. ${num})`, artista, tom: "", rows: [], paginas: [] };
      songs.push(cur);
    }
    if (p.tom && !cur.tom) cur.tom = p.tom;
    cur.rows.push(...rows);
    cur.paginas.push(num);
  });

  const result = songs.map((s, idx) => {
    const rows = [];
    for (const r of s.rows) {
      if (r.trim() === "" && (rows.length === 0 || rows[rows.length - 1] === "")) continue;
      rows.push(r.trimEnd());
    }
    while (rows.length && rows[rows.length - 1] === "") rows.pop();

    const corpo = rows.join("\n");
    const texto = s.tom ? `Tom: ${s.tom}\n\n${corpo}` : corpo;
    const temAcordes = rows.some((r) => isChordLine(r));

    const song = {
      id: `s${idx}`,
      nome: s.nome,
      artista: s.artista,
      texto,
      temAcordes,
      paginas: s.paginas,
      categoriaId: "",
      momento: "",
      aviso: temAcordes ? "" : "Só tem a letra, sem acordes.",
    };

    const entry = entries ? matchIndexEntry(song, entries) : null;
    if (entry) {
      song.momento = entry.label;
      song.categoriaId = categoriaFromLabel(entry.label, categorias);
      entry.usada = true;
    }
    if (!song.categoriaId) song.categoriaId = categoriaFromTitle(song.nome, categorias);
    return song;
  });

  for (const e of entries || []) {
    if (!e.usada) avisos.push(`Do índice, sem música correspondente no PDF: ${e.label}: ${e.title || "—"}`);
  }

  return { songs: result, avisos, indiceEncontrado: !!entries };
}
