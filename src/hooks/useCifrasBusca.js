import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCifrasService } from "../service/cifraService";
import { useCategorias } from "./queries/useCategorias";
import { useFavoritos } from "./queries/useFavoritos";
import { useSearch } from "./useSearch";
import { useRequireAuth } from "./useRequireAuth";
import { useCategoriaFilter } from "./useCategoriaFilter";
import { useInitialUrlFilters, useResetPageOnChange, useSyncUrlFilters } from "./useUrlFilters";

// Busca paginada de cifras com filtros (texto, categoria, artista, favoritas),
// refletidos na URL. Compartilhada pela Home e pela lista de Cifras.
//   limit      itens por página
//   withArtist habilita o filtro por artista (?artista=)
//   showParent mostra "Sub · Pai" no rótulo do filtro de categoria
export function useCifrasBusca({ limit, withArtist = false, showParent = false }) {
  const urlFilters = useInitialUrlFilters();
  const requireAuth = useRequireAuth();
  const { categorias } = useCategorias();
  const { favoritosIds, toggleFavorito } = useFavoritos();
  const favoritosSet = useMemo(() => new Set(favoritosIds), [favoritosIds]);

  const { search, setSearch, debounced } = useSearch(300, urlFilters.get("q"));
  const [categoriaFiltro, setCategoriaFiltro] = useState(() => urlFilters.get("cat"));
  const [artistaFiltro, setArtistaFiltro] = useState(() => (withArtist ? urlFilters.get("artista") : ""));
  const [favoritosMode, setFavoritosMode] = useState(() => urlFilters.get("fav") === "1");
  const [currentPage, setCurrentPage] = useState(() => urlFilters.getNumber("page"));

  const [cifras, setCifras] = useState([]);
  const [pages, setPages] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const { relevantCategoriaIds, filterLabel } = useCategoriaFilter(categorias, categoriaFiltro, { showParent });

  const controllerRef = useRef(null);
  const refetch = useCallback(async () => {
    // cancela a busca anterior: só a resposta da última digitação vale
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    // Modo favoritas sem nenhuma favorita: nem consulta (a lista ficaria "tudo")
    if (favoritosMode && favoritosIds.length === 0) {
      setCifras([]);
      setPages(0);
      setLoaded(true);
      return;
    }

    try {
      const res = await getCifrasService({
        nome: debounced || undefined,
        artista: artistaFiltro || undefined,
        categorias: relevantCategoriaIds.length ? relevantCategoriaIds : undefined,
        favoritos: favoritosMode ? favoritosIds : undefined,
        page: currentPage,
        limit,
        signal: controller.signal,
      });
      setCifras(res.data.cifras || []);
      setPages(res.data.pages || 0);
    } catch {
      // busca cancelada ou falha de rede: mantém a lista atual
    } finally {
      if (!controller.signal.aborted) setLoaded(true);
    }
  }, [debounced, artistaFiltro, relevantCategoriaIds, currentPage, favoritosMode, favoritosIds, limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useResetPageOnChange([debounced, artistaFiltro, categoriaFiltro, favoritosMode], () => setCurrentPage(0));
  useSyncUrlFilters({
    q: search,
    cat: categoriaFiltro,
    artista: artistaFiltro,
    fav: favoritosMode ? "1" : "",
    page: currentPage,
  });

  const handleToggleFavorito = useCallback(
    async (cifraId) => {
      if (!requireAuth("Você precisa fazer login para favoritar músicas.")) return;
      try {
        await toggleFavorito(cifraId);
      } catch {
        // falha ao favoritar: o coração só não muda
      }
    },
    [requireAuth, toggleFavorito],
  );

  // Entrar no modo "só favoritas" exige login (sair não)
  const handleToggleFavoritosMode = useCallback(() => {
    if (!favoritosMode && !requireAuth("Você precisa fazer login para ver suas favoritas.")) return;
    setFavoritosMode((m) => !m);
  }, [favoritosMode, requireAuth]);

  return {
    categorias,
    cifras,
    pages,
    loaded,
    refetch,
    search,
    setSearch,
    categoriaFiltro,
    setCategoriaFiltro,
    filterLabel,
    artistaFiltro,
    setArtistaFiltro,
    favoritosMode,
    setFavoritosMode,
    handleToggleFavoritosMode,
    favoritosIds,
    favoritosSet,
    handleToggleFavorito,
    currentPage,
    setCurrentPage,
  };
}
