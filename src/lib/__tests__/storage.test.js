import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { storage } from "../storage";

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("storage", () => {
  it("lê, grava e remove", () => {
    expect(storage.get("a")).toBeNull();
    expect(storage.set("a", 1)).toBe(true);
    expect(storage.get("a")).toBe("1");
    storage.remove("a");
    expect(storage.get("a")).toBeNull();
  });

  it("JSON: devolve o fallback quando ausente ou corrompido", () => {
    expect(storage.getJSON("x", [])).toEqual([]);
    storage.setJSON("x", { a: 1 });
    expect(storage.getJSON("x")).toEqual({ a: 1 });
    storage.set("x", "{quebrado");
    expect(storage.getJSON("x", "padrao")).toBe("padrao");
  });

  it("removeWithPrefix apaga só as chaves com o prefixo", () => {
    storage.set("offline_playlist_1", "a");
    storage.set("offline_playlist_2", "b");
    storage.set("theme", "dark");
    storage.removeWithPrefix("offline_playlist_");
    expect(storage.keysWithPrefix("offline_playlist_")).toEqual([]);
    expect(storage.get("theme")).toBe("dark");
  });

  it("nunca lança quando o navegador bloqueia o storage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("cota cheia");
    });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });

    expect(storage.get("a")).toBeNull();
    expect(storage.set("a", 1)).toBe(false);
    expect(() => storage.remove("a")).not.toThrow();
    expect(storage.getJSON("a", "fb")).toBe("fb");
  });
});
