import { beforeEach, describe, expect, it } from "vitest";
import {
  detectOriginalKey,
  getKeyAtOffset,
  getSemitonesTo,
  setAccidental,
  setSimplify,
  suggestCapo,
  transposeText,
} from "../transpose";

beforeEach(() => {
  localStorage.clear();
  setAccidental("sharp");
  setSimplify(false);
});

const cifra = "C       G\nDeve haver um lugar";

describe("transposeText", () => {
  it("não altera nada em 0 semitons", () => {
    expect(transposeText(cifra, 0)).toBe(cifra);
  });

  it("transpõe só as linhas de acordes e preserva a letra", () => {
    const out = transposeText(cifra, 2);
    expect(out.split("\n")[0]).toBe("D       A");
    expect(out.split("\n")[1]).toBe("Deve haver um lugar");
  });

  it("transpõe para baixo e dá a volta na escala", () => {
    expect(transposeText("C", -1)).toBe("B");
    expect(transposeText("B", 1)).toBe("C");
  });

  it("transpõe baixo invertido e qualidade do acorde", () => {
    expect(transposeText("Am7/G", 2)).toBe("Bm7/A");
  });

  it("reconhece 7M (bug antigo: a linha inteira ficava sem transpor)", () => {
    expect(transposeText("C7M  G", 2)).toBe("D7M  A");
  });

  it("atualiza a linha 'Tom:' do texto", () => {
    expect(transposeText("Tom: C\nC", 2)).toBe("Tom: D\nD");
  });

  it("transpõe também os acordes de '[Intro] Bm  D  Bm  A' (antes ficavam no tom antigo)", () => {
    expect(transposeText("[Intro] Bm  D  Bm  A\nBm  G", 2)).toBe("[Intro] C#m  E  C#m  B\nC#m  A");
  });

  it("não confunde letra com acorde", () => {
    const letra = "A casa de Deus";
    expect(transposeText(letra, 3)).toBe(letra);
  });
});

describe("preferência ♯/♭", () => {
  it("usa sustenido por padrão e bemol quando escolhido", () => {
    expect(transposeText("C", 1)).toBe("C#");
    setAccidental("flat");
    expect(transposeText("C", 1)).toBe("Db");
    expect(getKeyAtOffset("A#", 0)).toBe("Bb");
  });
});

describe("cifra simplificada", () => {
  it("reduz extensões e remove o baixo", () => {
    setSimplify(true);
    expect(transposeText("C7M  Am7  F/G  Dsus4  Bdim  Em", 0)).toBe("C  Am  F  D  Bm  Em");
  });

  it("combina com a transposição", () => {
    setSimplify(true);
    expect(transposeText("Am7", 2)).toBe("Bm");
  });
});

describe("tonalidade", () => {
  it("detecta pela linha 'Tom:' e, na falta, pelo primeiro acorde", () => {
    expect(detectOriginalKey("Tom: Eb\nC")).toBe("D#");
    expect(detectOriginalKey("G   C\nletra")).toBe("G");
    expect(detectOriginalKey("só letra")).toBeNull();
  });

  it("calcula o caminho mais curto entre tons", () => {
    expect(getSemitonesTo("C", "D")).toBe(2);
    expect(getSemitonesTo("C", "A")).toBe(-3);
  });

  it("sugere capotraste com formas fáceis, da menor casa para a maior", () => {
    expect(suggestCapo("Eb")[0]).toEqual({ shape: "D", capo: 1 });
    expect(suggestCapo("C")[0]).toEqual({ shape: "C", capo: 0 });
    expect(suggestCapo("X")).toEqual([]);
  });
});
