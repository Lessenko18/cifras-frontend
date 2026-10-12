import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

// Lê os filtros da URL só na montagem (?q=...&cat=...&page=2), pra que o botão
// "voltar" do navegador restaure a lista exatamente como estava.
export function useInitialUrlFilters() {
  const [searchParams] = useSearchParams();
  const ref = useRef(null);
  if (ref.current === null) {
    ref.current = {
      get: (key, fallback = "") => searchParams.get(key) ?? fallback,
      getNumber: (key) => Math.max(0, Number(searchParams.get(key)) || 0),
    };
  }
  return ref.current;
}

// Mantém a URL em sincronia com os filtros, substituindo a entrada atual do histórico
// (não cria uma entrada nova a cada letra digitada). Valores vazios/0 saem da URL.
export function useSyncUrlFilters(values) {
  const [, setSearchParams] = useSearchParams();
  const setRef = useRef(setSearchParams);
  setRef.current = setSearchParams;
  const key = JSON.stringify(values);

  useEffect(() => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(JSON.parse(key))) {
      if (v) next.set(k, String(v));
    }
    if (next.toString() === window.location.search.replace(/^\?/, "")) return;
    setRef.current(next, { replace: true });
  }, [key]);
}

// Volta pra página 0 quando um filtro muda, mas não na montagem (senão apagaria
// a página restaurada da URL).
export function useResetPageOnChange(deps, reset) {
  const prev = useRef(deps);
  const key = JSON.stringify(deps);
  useEffect(() => {
    if (JSON.stringify(prev.current) !== key) reset();
    prev.current = JSON.parse(key);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
