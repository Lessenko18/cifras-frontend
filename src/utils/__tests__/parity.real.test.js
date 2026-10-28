/* global process */
// Compara o caminho NOVO (ChordPro) com o ANTIGO (texto de duas linhas) usando as
// cifras reais, em vários tons e preferências. Só roda quando PARITY_FILE aponta para
// um export das cifras (ex.: Backend/backups/cifras-AAAA-MM-DD.json); no CI é pulado.
//
//   PARITY_FILE=../Backend/backups/cifras-2026-10-28.json npx vitest run src/utils/__tests__/parity.real.test.js
//
// Regras do que é aceitável:
//  - No tom original (n = 0) o resultado tem que ser EXATAMENTE igual.
//  - Ao transpor, a letra e a SEQUÊNCIA de acordes têm que ser iguais. O caminho antigo
//    pode errar a distribuição dos acordes entre as palavras (ao mudar o tamanho do
//    acorde, a linha desloca e o acorde cai em outra palavra): isso é o bug que o
//    ChordPro elimina, e conta como melhoria. Também é melhoria o antigo não transpor
//    um acorde que o parser reconhece (ex.: Dm7(9)).
import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { convertAndVerify } from "../chordpro";
import { detectKey, renderCifra, transposeSegments } from "../cifraDoc";
import { parseCifraText } from "../cifraParser";
import { detectOriginalKey, setAccidental, setSimplify } from "../transpose";

const file = process.env.PARITY_FILE;
const cifras = file && fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : [];

// Rótulos de seção equivalem mesmo com espaço sobrando ("[Parte] ", "[ Verso 1 ]")
const norm = (segments) =>
  JSON.stringify(
    segments.map((s) =>
      s.type === "plain" && /^\s*\[[^\]]+\]\s*$/.test(s.line) ? { ...s, line: `[${s.line.trim().slice(1, -1).trim()}]` } : s,
    ),
  );

// Só a letra e o texto comum (linhas de acordes ficam de fora: quem muda é o acorde)
const lyricOf = (segments) =>
  segments
    .filter((s) => s.type !== "chord-only")
    .map((s) => (s.type === "chord-lyric" ? s.tokens.map((t) => t.lyric).join("") : s.line ?? ""))
    .map((line) => (/^\s*\[[^\]]+\]\s*$/.test(line) ? `[${line.trim().slice(1, -1).trim()}]` : line))
    .join("\n");

const chordList = (segments) =>
  segments.flatMap((s) =>
    s.type === "chord-lyric"
      ? s.tokens.flatMap((t) => (t.chord ? t.chord.split(" ") : []))
      : s.type === "chord-only"
        ? s.line.split(/\s+/).filter(Boolean)
        : [],
  );

// igual | distribuicao (antigo errou em que palavra o acorde cai) |
// antigoNaoMexia (antigo deixou um acorde sem transpor/simplificar) | ruim
function classify(antigo, novo, base) {
  if (norm(antigo) === norm(novo)) return "igual";
  // antigo quebrou linhas de acordes: a transposição encolheu/colou acordes
  // ("G#" + "A#m" -> "G#A#m"), a linha deixou de ser reconhecida e virou texto comum
  const comAcordes = (segs) => segs.filter((s) => s.type === "chord-lyric" || s.type === "chord-only").length;
  if (comAcordes(antigo) < comAcordes(novo)) return "antigoQuebrou";
  if (lyricOf(antigo) !== lyricOf(novo)) return "ruim";
  const a = chordList(antigo);
  const n = chordList(novo);
  if (a.join(" ") === n.join(" ")) return "distribuicao";
  const b = chordList(base);
  if (a.length === n.length && a.every((chord, k) => chord === n[k] || chord === b[k])) return "antigoNaoMexia";
  return "ruim";
}

function setPrefs(flat, simple) {
  localStorage.setItem("acidente", flat ? "flat" : "sharp");
  localStorage.setItem("cifraSimples", simple ? "1" : "0");
  setAccidental(flat ? "flat" : "sharp");
  setSimplify(simple);
}

describe.skipIf(cifras.length === 0)("paridade ChordPro x texto antigo (cifras reais)", { timeout: 120000 }, () => {
  const casos = cifras
    .filter((c) => typeof c.observacao === "string" && c.observacao.trim())
    .map((c) => ({ nome: c.nome, text: c.observacao, conv: convertAndVerify(c.observacao) }));

  it("todas convertem e passam na verificação", () => {
    const falhas = casos.filter((c) => !c.conv.ok).map((c) => `${c.nome}: ${c.conv.reason}`);
    expect(falhas).toEqual([]);
  });

  it("no tom original, sem simplificar, a tela desenha EXATAMENTE o mesmo (♯ e ♭)", () => {
    const diffs = [];
    for (const flat of [false, true]) {
      setPrefs(flat, false);
      for (const c of casos) {
        const antigo = renderCifra({ text: c.text }, 0).segments;
        const novo = renderCifra({ text: c.text, chordpro: c.conv.chordpro }, 0).segments;
        if (norm(antigo) !== norm(novo)) diffs.push({ nome: c.nome, flat });
      }
    }
    setPrefs(false, false);
    expect(diffs).toEqual([]);
  });

  it("transpondo e/ou simplificando: mesma letra e mesmos acordes (só melhora a distribuição)", () => {
    const ruins = [];
    const stats = { igual: 0, distribuicao: 0, antigoNaoMexia: 0, antigoQuebrou: 0, ruim: 0 };
    for (const flat of [false, true]) {
      for (const simple of [false, true]) {
        setPrefs(flat, simple);
        for (let n = -6; n <= 6; n++) {
          if (n === 0 && !simple) continue; // coberto pelo teste exato acima
          for (const c of casos) {
            setPrefs(false, false);
            const base = renderCifra({ text: c.text }, 0).segments;
            setPrefs(flat, simple);
            const antigo = renderCifra({ text: c.text }, n).segments;
            const novo = renderCifra({ text: c.text, chordpro: c.conv.chordpro }, n).segments;
            const r = classify(antigo, novo, base);
            stats[r]++;
            if (r === "ruim") ruins.push({ nome: c.nome, n, flat, simple });
          }
        }
      }
    }
    setPrefs(false, false);
    console.log("CIFRA x TOM x PREFERÊNCIA:", stats);
    expect(ruins.slice(0, 8)).toEqual([]);
  });

  it("transpor o ChordPro = transpor os trechos originais (cada acorde fica na sua palavra)", () => {
    setPrefs(false, false);
    for (const c of casos) {
      for (const n of [-5, -1, 2, 7]) {
        const esperado = transposeSegments(parseCifraText(c.text), n);
        const novo = renderCifra({ text: c.text, chordpro: c.conv.chordpro }, n).segments;
        const comColunas = renderCifra({ text: c.text }, 0).segments; // só para garantir que não lança
        expect(comColunas.length).toBeGreaterThan(0);
        if (!c.text.includes("!!!")) expect(norm(novo)).toBe(norm(esperado));
      }
    }
  });

  it("o tom detectado é o mesmo de antes", () => {
    const diffs = casos
      .map((c) => ({ nome: c.nome, antigo: detectOriginalKey(c.text), novo: detectKey({ text: c.text, chordpro: c.conv.chordpro }) }))
      .filter((d) => d.antigo !== d.novo);
    expect(diffs).toEqual([]);
  });
});
