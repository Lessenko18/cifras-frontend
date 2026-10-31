import { describe, expect, it } from "vitest";
import { describeMusic, getMusicId, resolveInitialToms, toPdfSong } from "../playlistMusic";

describe("getMusicId", () => {
  it("aceita os vários formatos de id e tolera vazio", () => {
    expect(getMusicId({ _id: "a" })).toBe("a");
    expect(getMusicId({ id: "b" })).toBe("b");
    expect(getMusicId({ cifraId: "c" })).toBe("c");
    expect(getMusicId({ musicaId: "d" })).toBe("d");
    expect(getMusicId(null)).toBe(null);
  });
});

describe("resolveInitialToms", () => {
  const musicas = [{ _id: "a" }, { _id: "b" }, { _id: "c" }];
  const local = { b: 2 };

  it("servidor vence o aparelho; aparelho cobre o que falta; sem nada fica de fora", () => {
    const toms = resolveInitialToms(musicas, { a: 3, b: 5 }, (id) => local[id] ?? null);
    expect(toms).toEqual({ a: 3, b: 5 });

    const onlyLocal = resolveInitialToms(musicas, {}, (id) => local[id] ?? null);
    expect(onlyLocal).toEqual({ b: 2 });
  });

  it("tom 0 do servidor vale (não cai no do aparelho)", () => {
    expect(resolveInitialToms(musicas, { b: 0 }, (id) => local[id] ?? null)).toEqual({ b: 0 });
  });

  it("aceita lista e tons ausentes", () => {
    expect(resolveInitialToms(undefined, undefined, () => null)).toEqual({});
  });
});

describe("describeMusic / toPdfSong", () => {
  const music = { nome: "Teste", bpm: 80, descricao: "C       G\nDeve haver um lugar" };

  it("devolve tom original, tom atual e texto transposto", () => {
    const original = describeMusic(music, 0);
    expect(original.originalKey).toBeTruthy();
    const up = describeMusic(music, 2);
    expect(up.currentKey).not.toBe(original.currentKey);
    expect(up.doc.text).not.toBe(original.doc.text);
  });

  it("monta a música do PDF com tom e bpm", () => {
    const song = toPdfSong(music, 0);
    expect(song).toMatchObject({ nome: "Teste", bpm: 80 });
    expect(song.tom).toBeTruthy();
    expect(typeof song.text).toBe("string");
  });
});
