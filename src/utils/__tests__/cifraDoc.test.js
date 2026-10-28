import { beforeEach, describe, expect, it } from "vitest";
import { convertAndVerify } from "../chordpro";
import { detectKey, renderCifra, segmentsToText, splitColumns, transposeSegments } from "../cifraDoc";
import { parseCifraText } from "../cifraParser";
import { setAccidental, setSimplify } from "../transpose";

beforeEach(() => {
  localStorage.clear();
  setAccidental("sharp");
  setSimplify(false);
});

const TEXTO = "[Intro] Bm  D\n\n    Bm\nPercebo que o tempo\n       G    A\nnão passa";
const chordpro = (t) => convertAndVerify(t).chordpro;

describe("renderCifra", () => {
  it("sem ChordPro usa o caminho antigo (texto -> transposeText -> parser)", () => {
    const { segments } = renderCifra({ text: "C      G\nDeve haver um lugar" }, 2);
    expect(segments[0].tokens.map((t) => t.chord)).toEqual(["D", "A", "", ""]);
  });

  it("com ChordPro, desenha o mesmo que o texto no tom original", () => {
    const antigo = renderCifra({ text: TEXTO }, 0).segments;
    const novo = renderCifra({ text: TEXTO, chordpro: chordpro(TEXTO) }, 0).segments;
    expect(novo).toEqual(antigo);
  });

  it("cada acorde fica na sua palavra ao transpor (o texto antigo desloca ao mudar o tamanho)", () => {
    // G -> F# e A -> G#: o texto antigo recalcula as colunas; o ChordPro não
    const t = "C    G    A\numa frase aqui agora";
    const novo = renderCifra({ text: t, chordpro: chordpro(t) }, -1).segments[0];
    expect(novo.tokens.map((tk) => tk.chord)).toEqual(["B", "F#", "G#", ""]);
  });

  it("transpõe a Intro junto com o resto", () => {
    const { segments } = renderCifra({ text: TEXTO, chordpro: chordpro(TEXTO) }, 2);
    expect(segments[0]).toEqual({ type: "plain", line: "[Intro]" });
    expect(segments[1].line).toBe("C#m  E");
  });

  it("cifra simplificada reduz os acordes (inclusive os de uma mesma palavra)", () => {
    setSimplify(true);
    const t = "C7M  F/G\nTe adorar";
    const { segments } = renderCifra({ text: t, chordpro: chordpro(t) }, 0);
    expect(segments[0].tokens.map((tk) => tk.chord)).toEqual(["C", "F"]);
  });

  it("respeita a preferência de bemol", () => {
    setAccidental("flat");
    const t = "C\nletra";
    const { segments } = renderCifra({ text: t, chordpro: chordpro(t) }, 1);
    expect(segments[0].tokens[0].chord).toBe("Db");
  });
});

describe("colunas", () => {
  const t = "C\nlado esquerdo\n!!!\nG\nlado direito";

  it("divide nos separadores !!! (ChordPro e texto antigo dão o mesmo número de colunas)", () => {
    expect(renderCifra({ text: t, chordpro: chordpro(t) }).columns).toHaveLength(2);
    expect(renderCifra({ text: t }).columns).toHaveLength(2);
  });

  it("sem !!! é uma coluna só", () => {
    expect(renderCifra({ text: "C\nletra", chordpro: chordpro("C\nletra") }).columns).toHaveLength(1);
  });

  it("splitColumns ignora colunas vazias", () => {
    expect(splitColumns([{ type: "plain", line: "!!!" }, { type: "plain", line: "x" }])).toHaveLength(1);
  });
});

describe("detectKey", () => {
  it("enquanto o texto vem junto, o tom é o mesmo de antes (ignora a Intro)", () => {
    expect(detectKey({ text: TEXTO, chordpro: chordpro(TEXTO) })).toBe("B");
  });

  it("sem o texto, deduz do ChordPro", () => {
    expect(detectKey({ chordpro: "[G]Deve haver" })).toBe("G");
    expect(detectKey({ chordpro: "{comment: Tom}\nsó letra" })).toBeNull();
  });
});

describe("transposeSegments / segmentsToText", () => {
  it("não altera nada em 0 semitons sem simplificar", () => {
    const segs = parseCifraText("C\nletra");
    expect(transposeSegments(segs, 0)).toBe(segs);
  });

  it("transpõe a linha 'Tom:'", () => {
    const segs = transposeSegments(parseCifraText("Tom: C\nC\nletra"), 2);
    expect(segs[0].line).toBe("Tom: D");
  });

  it("segmentsToText monta duas linhas (acordes em cima) para o PDF", () => {
    const text = segmentsToText(parseCifraText("C      G\nDeve haver um lugar"));
    const [acordes, letra] = text.split("\n");
    expect(letra).toBe("Deve haver um lugar");
    expect(acordes.startsWith("C")).toBe(true);
    expect(acordes.indexOf("G")).toBe(letra.indexOf("haver"));
  });
});
