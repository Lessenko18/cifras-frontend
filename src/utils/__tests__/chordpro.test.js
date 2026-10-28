import { describe, expect, it } from "vitest";
import { parseCifraText } from "../cifraParser";
import { chordProToLegacy, chordProToSegments, convertAndVerify, legacyToChordPro } from "../chordpro";

// Mesmos casos do teste do backend: os dois lados precisam se comportar igual.
const A_PAZ = [
  "[Primeira Parte]",
  "C       Dm7        Em7  F/G",
  "Deve haver um lugar dentro do seu coração",
  "",
  "[Refrão]",
  "Am7    G",
  "Sinta, chegou o tempo",
].join("\n");

describe("legacyToChordPro", () => {
  it("cola o acorde na palavra onde ele cai", () => {
    expect(legacyToChordPro("C      G\nDeve haver um lugar")).toBe("[C]Deve [G]haver um lugar");
  });

  it("dois acordes na mesma palavra viram [F#][B]", () => {
    expect(convertAndVerify("F# B\naleluia")).toEqual({ ok: true, chordpro: "[F#][B]aleluia" });
  });
});

describe("convertAndVerify", () => {
  it("seção vira {comment: ...} e volta como [seção]", () => {
    const { ok, chordpro } = convertAndVerify(A_PAZ);
    expect(ok).toBe(true);
    expect(chordpro).toMatch(/^\{comment: Primeira Parte\}$/m);
    expect(chordProToLegacy(chordpro)).toMatch(/^\[Refrão\]$/m);
  });

  it("[Intro] D  G  A vira rótulo de seção + linha de acordes de verdade", () => {
    const { ok, chordpro } = convertAndVerify("[Intro] D  G  A\n\nC\nletra");
    expect(ok).toBe(true);
    expect(chordpro.split("\n").slice(0, 2)).toEqual(["{comment: Intro}", "[D]  [G]  [A]"]);
  });

  it("linha com colchetes que não é acorde ([Obs] repetir 2x) é guardada crua", () => {
    const { ok, chordpro } = convertAndVerify("[Obs] repetir 2x\n\nC\nletra");
    expect(ok).toBe(true);
    expect(chordpro).toMatch(/^\{x_linha: \[Obs\] repetir 2x\}$/m);
    expect(chordProToSegments(chordpro)[0]).toEqual({ type: "plain", line: "[Obs] repetir 2x" });
  });

  it("a tela enxerga EXATAMENTE o mesmo depois de converter", () => {
    const { ok, chordpro } = convertAndVerify(A_PAZ);
    expect(ok).toBe(true);
    const norm = (segs) => JSON.stringify(segs).replace(/\[Refrão\]/g, "[Refrão]");
    expect(norm(chordProToSegments(chordpro))).toBe(norm(parseCifraText(A_PAZ)));
  });

  it("palavra curta com vários acordes não perde nenhum (caso real: 'por')", () => {
    const original = "       F#m F#m7/E\nTe adorar por quem não te";
    const { ok, chordpro } = convertAndVerify(original);
    expect(ok).toBe(true);
    const chords = chordProToSegments(chordpro)[0].tokens.map((t) => t.chord).filter(Boolean);
    expect(chords.join(" ")).toBe("F#m F#m7/E");
  });

  it("recusa texto vazio e letra pareada com colchetes", () => {
    expect(convertAndVerify("").ok).toBe(false);
    expect(convertAndVerify("C\nRefrão [2x] aqui").ok).toBe(false);
  });
});
