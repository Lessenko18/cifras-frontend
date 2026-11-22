import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "../../test/renderHook";
import { useAutoScroll } from "../useAutoScroll";
import { useFontSize } from "../useFontSize";
import { createStoredNumber, createStoredPreference } from "../../lib/storedPreference";

beforeEach(() => localStorage.clear());

describe("useAutoScroll (velocidade por cifra)", () => {
  it("lembra a velocidade de cada cifra e volta a ela ao trocar", () => {
    const { result, rerender } = renderHook(useAutoScroll, { levelKey: "scroll_a" });
    expect(result.current.level).toBe(3); // padrão
    act(() => result.current.faster());
    act(() => result.current.faster());
    expect(result.current.level).toBe(5);
    expect(localStorage.getItem("scroll_a")).toBe("5");

    rerender({ levelKey: "scroll_b" });
    expect(result.current.level).toBe(3);
    act(() => result.current.slower());
    expect(result.current.level).toBe(2);

    rerender({ levelKey: "scroll_a" });
    expect(result.current.level).toBe(5);
  });

  it("respeita os limites e ignora valor salvo inválido", () => {
    localStorage.setItem("scroll_x", "99");
    const { result } = renderHook(useAutoScroll, { levelKey: "scroll_x" });
    expect(result.current.level).toBe(3);
    for (let i = 0; i < 20; i++) act(() => result.current.slower());
    expect(result.current.level).toBe(0);
  });

  it("sem levelKey não grava nada", () => {
    const { result } = renderHook(useAutoScroll, {});
    act(() => result.current.faster());
    expect(localStorage.length).toBe(0);
  });
});

describe("useFontSize / createStoredNumber", () => {
  it("limita entre 12 e 30 e persiste", () => {
    const { result } = renderHook(() => useFontSize());
    expect(result.current[0]).toBe(18);
    for (let i = 0; i < 20; i++) act(() => result.current[1](2));
    expect(result.current[0]).toBe(30);
    expect(localStorage.getItem("cifra_fontSize")).toBe("30");
  });

  it("valor salvo fora dos limites é corrigido", () => {
    localStorage.setItem("n", "500");
    expect(createStoredNumber("n", { initial: 10, min: 1, max: 20 }).get()).toBe(20);
    localStorage.setItem("n", "lixo");
    expect(createStoredNumber("n", { initial: 10, min: 1, max: 20 }).get()).toBe(10);
  });
});

describe("createStoredPreference", () => {
  it("avisa quem usa o hook quando o valor muda", () => {
    const pref = createStoredPreference("tema", { parse: (raw) => (raw === "claro" ? "claro" : "escuro") });
    const { result } = renderHook(() => pref.use());
    expect(result.current).toBe("escuro");
    act(() => pref.set("claro"));
    expect(result.current).toBe("claro");
    act(() => pref.set("qualquer"));
    expect(result.current).toBe("escuro");
  });
});
