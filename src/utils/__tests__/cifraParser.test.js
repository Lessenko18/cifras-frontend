import { describe, expect, it } from "vitest";
import { isChordLine, parseCifraText } from "../cifraParser";

describe("isChordLine", () => {
  it("aceita linhas só de acordes", () => {
    expect(isChordLine("C   G   Am7  F/A")).toBe(true);
    expect(isChordLine("C7M  Dm7(9)")).toBe(true);
  });

  it("rejeita letra e linha vazia", () => {
    expect(isChordLine("Deve haver um lugar")).toBe(false);
    expect(isChordLine("   ")).toBe(false);
    expect(isChordLine("Tom: C")).toBe(false);
  });
});

describe("parseCifraText", () => {
  it("emparelha acorde com a palavra onde ele cai", () => {
    const [seg] = parseCifraText("C      G\nDeve haver um lugar");
    expect(seg.type).toBe("chord-lyric");
    expect(seg.tokens[0]).toMatchObject({ chord: "C", lyric: "Deve " });
  });

  it("junta acordes que caem na mesma palavra (o renderizador separa depois)", () => {
    const [seg] = parseCifraText("F# B\nalelu");
    expect(seg.tokens[0].chord).toBe("F# B");
  });

  it("marca linhas em branco e texto puro", () => {
    const segs = parseCifraText("[Refrão]\n\nsó letra aqui");
    expect(segs.map((s) => s.type)).toEqual(["plain", "blank", "plain"]);
  });

  it("separa '[Intro] Bm  D' em rótulo de seção + linha de acordes", () => {
    const segs = parseCifraText("[Intro] Bm  D  Bm  A\n\nletra");
    expect(segs[0]).toEqual({ type: "plain", line: "[Intro]" });
    expect(segs[1]).toEqual({ type: "chord-only", line: "Bm  D  Bm  A" });
  });

  it("os acordes do rótulo ainda se emparelham com a letra de baixo", () => {
    const segs = parseCifraText("[Intro] Bm\nPercebo que");
    expect(segs[0]).toEqual({ type: "plain", line: "[Intro]" });
    expect(segs[1].type).toBe("chord-lyric");
    expect(segs[1].tokens[0].chord).toBe("Bm");
  });

  it("não mexe em '[Obs] repetir 2x' (não são acordes)", () => {
    expect(parseCifraText("[Obs] repetir 2x")).toEqual([{ type: "plain", line: "[Obs] repetir 2x" }]);
  });

  it("remove caracteres invisíveis que o Cifra Club cola no começo da linha", () => {
    const [seg] = parseCifraText("​D\nletra");
    expect(seg.type).toBe("chord-lyric");
    expect(seg.tokens[0].chord).toBe("D");
  });
});
