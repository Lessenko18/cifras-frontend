import { describe, expect, it } from "vitest";
import { isChordLine } from "../cifraParser";
import { isChordToken, normalizeDim } from "../chordSyntax";
import { transposeText } from "../transpose";
import { parseChord } from "../chordLookup";

// Os 3 consumidores (parser de linhas, transposição, diagramas) PRECISAM concordar sobre
// o que é um acorde. Se alguém voltar a ter regra própria, este teste quebra.
const VALIDOS = [
  "C", "Am", "G7", "F#m7", "Bb", "C/E", "Dm7sus4", "Cmaj7", "Asus2", "C7M", "Dm7(9)",
  "Am7(b5)", "B4/7", "D9", "Bdim", "Caug", "C+", "D#°", "D#º", "D#˚", "E/GF#m7", "(G", "A)",
];
const INVALIDOS = ["Deve", "haver", "Tom:", "H", "Cx", "um", "lugar", "H7"];

describe("sintaxe de acorde única", () => {
  it.each(VALIDOS)("aceita %s no parser de linhas", (acorde) => {
    expect(isChordToken(acorde)).toBe(true);
    expect(isChordLine(`   ${acorde}   `)).toBe(true);
  });

  it.each(INVALIDOS)("rejeita %s", (palavra) => {
    expect(isChordToken(palavra)).toBe(false);
  });

  it.each(VALIDOS.filter((a) => !/[()]/.test(a) && !a.includes("E/GF#")))(
    "transposição enxerga a linha com %s",
    (acorde) => {
      // se a linha não fosse reconhecida como de acordes, ficaria igual
      expect(transposeText(`Em  ${acorde}`, 2)).not.toBe(`Em  ${acorde}`);
    },
  );

  it.each(["D#°", "D#º", "D#˚"])("diagrama reconhece %s", (acorde) => {
    expect(parseChord(acorde)).toMatchObject({ root: "D#", suffix: "dim" });
  });

  it("normaliza as variantes de diminuto", () => {
    expect(normalizeDim("º˚∘°")).toBe("°°°°");
  });
});
