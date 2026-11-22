import { beforeEach, describe, expect, it } from "vitest";
import { detectKey, detectMinor, renderCifra } from "../cifraDoc";
import { detectOriginalMinor, getKeyAtOffset, setAccidental, setSimplify, transposeText, wrapSemitones } from "../transpose";
import { getSavedTom, saveTom } from "../tomStorage";
import { getLocalBpm, saveLocalBpm } from "../bpmStorage";
import { loadCifraCache, saveCifraCache } from "../offlineCifra";
import { passwordStrength } from "../passwordStrength";

beforeEach(() => {
  localStorage.clear();
  setAccidental("sharp");
  setSimplify(false);
});

describe("wrapSemitones / tom guardado", () => {
  it("mantém o tom entre -5 e +6", () => {
    expect([0, 6, 7, 12, 13, -6, -7, -12].map(wrapSemitones)).toEqual([0, 6, -5, 0, 1, 6, 5, 0]);
  });

  it("tomStorage grava normalizado e apaga quando volta ao original", () => {
    saveTom("x", 14);
    expect(getSavedTom("x")).toBe(2);
    saveTom("x", 12);
    expect(localStorage.getItem("tom_x")).toBeNull();
    localStorage.setItem("tom_y", "19"); // valor antigo sem normalizar
    expect(getSavedTom("y")).toBe(-5);
  });
});

describe("preferências como argumento (sem ler o storage)", () => {
  it("grafia e simplificação passadas explicitamente valem mais que o salvo", () => {
    const text = "C7M     F/G\nDeve haver";
    expect(transposeText(text, 1, { accidental: "flat", simplify: false })).toContain("Db7M");
    expect(transposeText(text, 1, { accidental: "sharp", simplify: true }).split("\n")[0].trim()).toBe("C#     F#");
    expect(getKeyAtOffset("C#", 0, "flat")).toBe("Db");
    expect(getKeyAtOffset("C#", 0, "sharp")).toBe("C#");
  });

  it("renderCifra aceita as preferências (texto e ChordPro)", () => {
    const legacy = renderCifra({ text: "C\nluz" }, 1, { accidental: "flat" });
    expect(legacy.text).toContain("Db");
    const pro = renderCifra({ chordpro: "[C]luz" }, 1, { accidental: "flat" });
    expect(pro.segments[0].tokens[0].chord).toBe("Db");
  });
});

describe("tom menor", () => {
  it("detecta pela linha Tom: e pelo primeiro acorde", () => {
    expect(detectOriginalMinor("Tom: Am\nAm  G\nluz")).toBe(true);
    expect(detectOriginalMinor("Tom: A\nAm  G\nluz")).toBe(false);
    expect(detectOriginalMinor("Em  G\nluz")).toBe(true);
    expect(detectOriginalMinor("Emaj7  G\nluz")).toBe(false);
    expect(detectOriginalMinor("")).toBe(false);
  });

  it("no ChordPro dá o mesmo resultado", () => {
    expect(detectMinor({ chordpro: "[Am]luz [G]sol" })).toBe(true);
    expect(detectMinor({ chordpro: "[C]luz [Am]sol" })).toBe(false);
    expect(detectKey({ chordpro: "[Am]luz" })).toBe("A");
  });
});

describe("BPM e cifra offline neste aparelho", () => {
  it("guarda o BPM de quem não edita a cifra", () => {
    expect(getLocalBpm("c1")).toBeNull();
    saveLocalBpm("c1", 96.4);
    expect(getLocalBpm("c1")).toBe(96);
  });

  it("guarda só as últimas 30 cifras", () => {
    for (let i = 0; i < 32; i++) saveCifraCache(`id${i}`, { _id: `id${i}`, nome: `m${i}` });
    expect(loadCifraCache("id0")).toBeNull();
    expect(loadCifraCache("id1")).toBeNull();
    expect(loadCifraCache("id2").nome).toBe("m2");
    expect(loadCifraCache("id31").nome).toBe("m31");
  });

  it("reabrir uma cifra a coloca como a mais recente", () => {
    for (let i = 0; i < 30; i++) saveCifraCache(`k${i}`, { _id: `k${i}` });
    saveCifraCache("k0", { _id: "k0" });
    saveCifraCache("novo", { _id: "novo" });
    expect(loadCifraCache("k0")).not.toBeNull();
    expect(loadCifraCache("k1")).toBeNull();
  });
});

describe("passwordStrength", () => {
  it("classifica de 0 a 4 e nunca passa de 'fraca' abaixo de 8", () => {
    expect(passwordStrength("").label).toBe("");
    expect(passwordStrength("12345678").score).toBe(0);
    expect(passwordStrength("abc").score).toBeLessThanOrEqual(1);
    expect(passwordStrength("Violao#Louvor2026").score).toBe(4);
  });
});

describe("capotraste de verdade", () => {
  it("guarda a casa por cifra (0 apaga, fora dos limites é corrigido)", async () => {
    const { getCapo, saveCapo } = await import("../capoStorage");
    expect(getCapo("c1")).toBe(0);
    saveCapo("c1", 3);
    expect(getCapo("c1")).toBe(3);
    saveCapo("c1", 99);
    expect(getCapo("c1")).toBe(11);
    saveCapo("c1", 0);
    expect(localStorage.getItem("capo_c1")).toBeNull();
    localStorage.setItem("capo_x", "lixo");
    expect(getCapo("x")).toBe(0);
  });

  it("o tom continua o que soa e a cifra mostra as formas com capo", async () => {
    const { describeMusic } = await import("../playlistMusic");
    const music = { nome: "x", chordpro: "[D]luz [A]sol" };
    const sem = describeMusic(music, 0);
    const com = describeMusic(music, 0, { capo: 2 }); // soa em D, toca formas de C
    expect(com.currentKey).toBe(sem.currentKey);
    expect(com.capo).toBe(2);
    expect(com.doc.segments[0].tokens.map((t) => t.chord)).toEqual(["C", "G"]);
    // somando um tom: soa em E, capo 2 -> formas de D
    expect(describeMusic(music, 2, { capo: 2 }).doc.segments[0].tokens[0].chord).toBe("D");
    // sem capo nada muda
    expect(sem.doc.segments[0].tokens[0].chord).toBe("D");
  });

  it("o PDF informa a casa do capo", async () => {
    const { toPdfSong } = await import("../playlistMusic");
    expect(toPdfSong({ nome: "x", chordpro: "[D]luz" }, 0, { capo: 2 }).capo).toBe(2);
  });
});
