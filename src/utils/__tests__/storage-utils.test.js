import { beforeEach, describe, expect, it } from "vitest";
import {
  clearOfflinePlaylists,
  hasOfflinePlaylist,
  loadOfflinePlaylist,
  removeOfflinePlaylist,
  saveOfflinePlaylist,
} from "../offlinePlaylist";
import { getRecentCifras, pushRecentCifra } from "../recentCifras";

beforeEach(() => localStorage.clear());

describe("offlinePlaylist", () => {
  it("salva, lê e remove uma playlist", () => {
    expect(hasOfflinePlaylist("a")).toBe(false);
    expect(saveOfflinePlaylist("a", { nome: "Missa", musicas: [] })).toBe(true);
    expect(hasOfflinePlaylist("a")).toBe(true);
    expect(loadOfflinePlaylist("a")).toEqual({ nome: "Missa", musicas: [] });
    removeOfflinePlaylist("a");
    expect(loadOfflinePlaylist("a")).toBeNull();
  });

  it("clearOfflinePlaylists (logout) só apaga as cópias offline", () => {
    saveOfflinePlaylist("a", {});
    saveOfflinePlaylist("b", {});
    localStorage.setItem("theme", "dark");
    clearOfflinePlaylists();
    expect(hasOfflinePlaylist("a")).toBe(false);
    expect(hasOfflinePlaylist("b")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("não quebra com JSON corrompido", () => {
    localStorage.setItem("offline_playlist_x", "{quebrado");
    expect(loadOfflinePlaylist("x")).toBeNull();
  });
});

describe("recentCifras", () => {
  it("mantém as mais recentes primeiro, sem repetir, no máximo 6", () => {
    for (let i = 1; i <= 8; i++) pushRecentCifra({ id: i, nome: `Música ${i}` });
    pushRecentCifra({ id: 5, nome: "Música 5" });
    const ids = getRecentCifras().map((c) => c.id);
    expect(ids).toHaveLength(6);
    expect(ids[0]).toBe("5");
    expect(new Set(ids).size).toBe(6);
  });

  it("ignora entradas inválidas", () => {
    pushRecentCifra({ id: "", nome: "x" });
    localStorage.setItem("cifras_recentes", "lixo");
    expect(getRecentCifras()).toEqual([]);
  });
});
