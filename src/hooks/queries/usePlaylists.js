import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPlaylistsService } from "../../service/playlistService";

export const playlistsKey = ["playlists"];

// Lista de playlists do usuário. Compartilhada por Home, Playlists e pelo "+"
// das cifras: uma busca só e todos veem a mesma lista atualizada.
export function usePlaylists({ enabled = true } = {}) {
  return useQuery({
    queryKey: playlistsKey,
    queryFn: async () => (await getPlaylistsService()).data || [],
    enabled,
  });
}

// Devolve uma função que marca a lista como desatualizada (e a rebusca).
export function useInvalidatePlaylists() {
  const queryClient = useQueryClient();
  return useCallback(() => queryClient.invalidateQueries({ queryKey: playlistsKey }), [queryClient]);
}
