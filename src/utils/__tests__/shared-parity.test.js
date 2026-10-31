import { describe, expect, it } from "vitest";
import { checkShared } from "../../../scripts/sync-shared.mjs";

// Garante que o backend não divergiu do parser do frontend (ver scripts/sync-shared.mjs).
// Sem o repositório do backend ao lado (ex.: CI do front), é ignorado.
describe("parser compartilhado com o backend", () => {
  it("as cópias do backend são idênticas às geradas a partir do frontend", () => {
    const { skipped, diverged } = checkShared();
    if (skipped) return;
    expect(diverged, 'rode "npm run sync:shared"').toEqual([]);
  });
});
