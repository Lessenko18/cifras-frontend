import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFavoritosService, toggleFavoritoService } from "../../service/favoritosService";
import { useAuth } from "../../context/AuthContext";

export const favoritosKey = ["favoritos"];

const EMPTY = [];

// Ids das cifras favoritas do usuário logado + ação de favoritar/desfavoritar.
// Home e Cifras compartilham o mesmo cache (antes cada uma tinha a sua cópia).
export function useFavoritos() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: favoritosKey,
    queryFn: getFavoritosService,
    enabled: isAuthenticated,
  });

  // Rejeita se o servidor falhar: quem chama decide se avisa o usuário.
  const toggleFavorito = useCallback(
    async (cifraId) => {
      const updated = await toggleFavoritoService(cifraId);
      queryClient.setQueryData(favoritosKey, updated);
      return updated;
    },
    [queryClient],
  );

  return { favoritosIds: isAuthenticated ? data ?? EMPTY : EMPTY, toggleFavorito };
}
