import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategoriasService } from "../../service/categoriaService";

export const categoriasKey = ["categorias"];

const EMPTY = [];

// Lista de categorias (Home, Cifras, Roteiro e admin). Muda pouco: 5 min de cache.
export function useCategorias() {
  const query = useQuery({
    queryKey: categoriasKey,
    queryFn: async () => {
      const { data } = await getCategoriasService();
      return Array.isArray(data) ? data : EMPTY;
    },
    staleTime: 5 * 60 * 1000,
  });
  return { ...query, categorias: query.data ?? EMPTY };
}

// Devolve uma função que força a rebusca (a tela de admin chama após criar/editar/excluir).
export function useInvalidateCategorias() {
  const queryClient = useQueryClient();
  return useCallback(() => queryClient.invalidateQueries({ queryKey: categoriasKey }), [queryClient]);
}
