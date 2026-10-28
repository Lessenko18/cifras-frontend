import { describe, expect, it } from "vitest";
import { formatCount, formatRelativeDate, getInitials, sortByNome, stripEmoji } from "../homeHelpers";

describe("formatCount", () => {
  it("abrevia milhares e esconde zero", () => {
    expect(formatCount(0)).toBeNull();
    expect(formatCount(7)).toBe("7");
    expect(formatCount(1000)).toBe("1k");
    expect(formatCount(1500)).toBe("1.5k");
  });
});

describe("formatRelativeDate", () => {
  it("diz Hoje, Ontem ou quantos dias", () => {
    const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
    expect(formatRelativeDate(null)).toBeNull();
    expect(formatRelativeDate(new Date().toISOString())).toBe("Hoje");
    expect(formatRelativeDate(daysAgo(1))).toBe("Ontem");
    expect(formatRelativeDate(daysAgo(5))).toBe("5 dias");
  });
});

describe("getInitials", () => {
  it("usa até duas iniciais em maiúsculas", () => {
    expect(getInitials("frei gilson")).toBe("FG");
    expect(getInitials("Shalom")).toBe("S");
    expect(getInitials("Ana Maria da Silva")).toBe("AM");
    expect(getInitials("")).toBe("?");
  });
});

describe("sortByNome", () => {
  it("ordena em pt-BR ignorando acento e caixa", () => {
    const nomes = [{ nome: "Zé" }, { nome: "álvaro" }, { nome: "Beto" }];
    expect(nomes.sort(sortByNome).map((n) => n.nome)).toEqual(["álvaro", "Beto", "Zé"]);
  });
});

describe("stripEmoji", () => {
  it("remove o emoji de música do começo do nome", () => {
    expect(stripEmoji("🎵 Missa 11/10")).toBe("Missa 11/10");
    expect(stripEmoji("Missa")).toBe("Missa");
    expect(stripEmoji(undefined)).toBe("");
  });
});
