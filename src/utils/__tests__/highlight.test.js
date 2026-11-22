import { describe, expect, it } from "vitest";
import { searchTerms, splitHighlight } from "../highlight";

const marked = (text, query) => splitHighlight(text, query).filter((p) => p.match).map((p) => p.text);

describe("splitHighlight", () => {
  it("ignora acento e caixa, mantendo o texto original", () => {
    expect(marked("Coração de Deus", "coracao")).toEqual(["Coração"]);
    expect(marked("Céu e Terra", "CEU")).toEqual(["Céu"]);
    expect(splitHighlight("Coração", "cora").map((p) => p.text).join("")).toBe("Coração");
  });

  it("destaca cada palavra digitada, em qualquer ordem", () => {
    expect(marked("Deus é Amor", "amor deus")).toEqual(["Deus", "Amor"]);
  });

  it("destaca todas as ocorrências", () => {
    expect(marked("Santo, Santo, Santo", "santo")).toHaveLength(3);
  });

  it("sem busca ou sem ocorrência, um trecho só e sem destaque", () => {
    expect(splitHighlight("Deus é Amor", "")).toEqual([{ text: "Deus é Amor", match: false }]);
    expect(splitHighlight("Deus é Amor", "xyz")).toEqual([{ text: "Deus é Amor", match: false }]);
    expect(splitHighlight("", "a")).toEqual([{ text: "", match: false }]);
  });

  it("caracteres especiais da busca não quebram nada", () => {
    expect(marked("Abba (Pai)", "(pai")).toEqual(["(Pai"]);
    expect(marked("a.b", ".*")).toEqual([]);
  });

  it("limita a 6 palavras", () => {
    expect(searchTerms("a b c d e f g h")).toHaveLength(6);
  });
});
