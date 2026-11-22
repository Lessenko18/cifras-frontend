import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "../../../../test/renderHook";

vi.mock("../../../../service/cifraService", () => ({
  getCifraById: vi.fn(),
  registerCifraAccessService: vi.fn(() => Promise.resolve()),
}));
vi.mock("../../../../service/categoriaService", () => ({
  getCategoriaById: vi.fn(),
}));

import { getCifraById } from "../../../../service/cifraService";
import { getCategoriaById } from "../../../../service/categoriaService";
import { useCifraDetalhe } from "../useCifraDetalhe";

const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 0)); });
const cifra = (id, extra = {}) => ({ data: { _id: id, nome: `Música ${id}`, observacao: "C", categorias: [], ...extra } });

beforeEach(() => {
  localStorage.clear();
  getCategoriaById.mockResolvedValue({ data: { _id: "c1", nome: "Louvor" } });
});

describe("useCifraDetalhe", () => {
  it("começa em 'loading' e passa para 'ok' com a cifra carregada", async () => {
    getCifraById.mockResolvedValue(cifra("a1"));
    const { result } = renderHook(useCifraDetalhe, "a1");
    expect(result.current.status).toBe("loading");
    await flush();
    expect(result.current.status).toBe("ok");
    expect(result.current.cifra.nome).toBe("Música a1");
  });

  it("falha de servidor vira 'error' com mensagem (e 404 tem mensagem própria)", async () => {
    getCifraById.mockRejectedValue({ response: { status: 404 } });
    const { result } = renderHook(useCifraDetalhe, "a2");
    await flush();
    expect(result.current.status).toBe("error");
    expect(result.current.erro).toMatch(/não encontrada/i);
  });

  it("ao trocar de cifra, a anterior some na hora (nunca mostra a cifra errada)", async () => {
    getCifraById.mockImplementation((id) => (id === "b1" ? Promise.resolve(cifra("b1")) : new Promise(() => {})));
    const { result, rerender } = renderHook(useCifraDetalhe, "b1");
    await flush();
    expect(result.current.cifra.nome).toBe("Música b1");
    rerender("b2");
    expect(result.current.status).toBe("loading");
    expect(result.current.cifra.nome).toBeUndefined();
  });

  it("uma categoria que falha não derruba a cifra", async () => {
    getCifraById.mockResolvedValue(cifra("c1x", { categorias: ["c1", "c2"] }));
    getCategoriaById.mockImplementation((c) => (c === "c1" ? Promise.resolve({ data: { _id: "c1", nome: "Louvor" } }) : Promise.reject(new Error("x"))));
    const { result } = renderHook(useCifraDetalhe, "c1x");
    await flush();
    expect(result.current.status).toBe("ok");
    expect(result.current.escolhidos.map((c) => c.nome)).toEqual(["Louvor"]);
  });

  it("sem rede, abre a cópia guardada no aparelho", async () => {
    getCifraById.mockResolvedValueOnce(cifra("d1"));
    const first = renderHook(useCifraDetalhe, "d1");
    await flush();
    first.unmount();

    getCifraById.mockRejectedValue(new Error("Network Error")); // sem `response`
    const { result } = renderHook(useCifraDetalhe, "d1");
    await flush();
    expect(result.current.status).toBe("ok");
    expect(result.current.cifra.nome).toBe("Música d1");
  });

  it("o tom é guardado normalizado (+12 = original)", async () => {
    getCifraById.mockResolvedValue(cifra("e1"));
    const { result } = renderHook(useCifraDetalhe, "e1");
    await flush();
    act(() => result.current.setSemitones(14));
    expect(result.current.semitones).toBe(2);
    act(() => result.current.setSemitones(7));
    expect(result.current.semitones).toBe(-5);
  });
});
