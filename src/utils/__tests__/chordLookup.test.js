import { describe, expect, it } from "vitest";
import { chordNotes, findChord, parseChord } from "../chordLookup";

describe("parseChord", () => {
  it("separa fundamental, sufixo e baixo", () => {
    expect(parseChord("F#m7")).toEqual({ root: "F#", suffix: "m7", bass: null });
    expect(parseChord("C7M")).toMatchObject({ suffix: "maj7" });
    expect(parseChord("Am/C")).toEqual({ root: "A", suffix: "minor", bass: "C" });
    expect(parseChord("(G)")).toMatchObject({ root: "G", suffix: "major" });
  });

  it("rejeita o que não é acorde", () => {
    expect(parseChord("F# B")).toBeNull();
    expect(parseChord("letra")).toBeNull();
  });
});

describe("findChord (banco do violão)", () => {
  const data = {
    chords: {
      C: [{ suffix: "major", positions: [1] }],
      Csharp: [{ suffix: "minor", positions: [2] }],
    },
  };

  it("traduz C# para a chave do banco", () => {
    expect(findChord(data, "guitar", "C#m")).toMatchObject({ key: "Csharp", positions: [2] });
  });

  it("devolve null para acorde inexistente", () => {
    expect(findChord(data, "guitar", "Cdim")).toBeNull();
    expect(findChord(data, "guitar", "H")).toBeNull();
  });
});

describe("chordNotes (teclado)", () => {
  it("calcula as notas na grafia pedida", () => {
    expect(chordNotes("F#").notes).toEqual(["F#", "A#", "C#"]);
    expect(chordNotes("Bb", true).notes).toEqual(["Bb", "D", "F"]);
  });

  it("entende 7M como maj7", () => {
    expect(chordNotes("C7M").notes).toEqual(["C", "E", "G", "B"]);
  });

  it("gera fundamental e inversões, todas dentro das 3 oitavas", () => {
    const { voicings } = chordNotes("C");
    expect(voicings.map((v) => v.label)).toEqual(["Posição fundamental", "1ª inversão", "2ª inversão"]);
    for (const v of voicings) expect(Math.max(...v.keys)).toBeLessThanOrEqual(35);
  });

  it("acorde com baixo tem uma posição só, com o baixo na nota mais grave", () => {
    const { voicings } = chordNotes("G/B");
    expect(voicings).toHaveLength(1);
    expect(voicings[0].keys[0]).toBe(Math.min(...voicings[0].keys));
    expect(voicings[0].names[voicings[0].keys[0]]).toBe("B");
  });

  it("usa a tonal para acordes fora da tabela", () => {
    expect(chordNotes("C13b9")).not.toBeNull();
  });

  it("devolve null quando não há como calcular", () => {
    expect(chordNotes("xyz")).toBeNull();
  });
});
