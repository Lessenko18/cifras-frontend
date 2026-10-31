import { beforeEach, describe, expect, it } from "vitest";
import { getSavedTom, hasSavedTom, saveTom } from "../tomStorage";

beforeEach(() => localStorage.clear());

describe("tomStorage", () => {
  it("sem nada salvo o tom é 0 (original)", () => {
    expect(getSavedTom("abc")).toBe(0);
    expect(hasSavedTom("abc")).toBe(false);
  });

  it("grava e lê tons positivos e negativos", () => {
    saveTom("abc", 3);
    saveTom("def", -2);
    expect(getSavedTom("abc")).toBe(3);
    expect(getSavedTom("def")).toBe(-2);
    expect(hasSavedTom("abc")).toBe(true);
  });

  it("voltar para 0 apaga o registro", () => {
    saveTom("abc", 5);
    saveTom("abc", 0);
    expect(hasSavedTom("abc")).toBe(false);
  });

  it("valor corrompido vira 0 e id vazio é ignorado", () => {
    localStorage.setItem("tom_abc", "lixo");
    expect(getSavedTom("abc")).toBe(0);
    saveTom(undefined, 2);
    expect(hasSavedTom(undefined)).toBe(false);
  });
});
