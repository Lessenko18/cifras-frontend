import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { usePlaylistManager } from "../../components/PlaylistManager/PlaylistManager";
import EmptyState from "../../components/EmptyState/EmptyState";
import { SkeletonRows } from "../../components/Skeleton/Skeleton";
import CategoriaFilterDropdown from "../../components/CategoriaFilterDropdown/CategoriaFilterDropdown";
import Paginacao from "../../components/Paginacao/Paginacao";
import { getCifraHomeInsightsService } from "../../service/cifraService";
import { usePlaylists, useInvalidatePlaylists } from "../../hooks/queries/usePlaylists";
import { useCifrasBusca } from "../../hooks/useCifrasBusca";
import { useAuth } from "../../context/AuthContext";
import * as S from "./HomeStyled";
import { CifraListItem } from "./HomeParts";
import PlaylistsPanel from "./PlaylistsPanel";
import InsightsSection from "./InsightsSection";

const NO_PLAYLISTS = [];
const EMPTY_INSIGHTS = { maisAcessadasMes: [], maisAcessadas: [], novas: [], artistasMaisAcessados: [] };

const FILTER_STYLES = {
  Wrapper: S.FilterDropdownWrapper,
  Trigger: S.FilterDropdownTrigger,
  Panel: S.FilterDropdownPanel,
  Item: S.FilterDropdownItem,
};
const PAGINATION_STYLES = {
  Container: S.PaginationContainer,
  Button: S.PaginationButton,
  Info: S.PaginationInfo,
};

export default function Home() {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const cifraPanelRef = useRef(null);
  const [insights, setInsights] = useState(EMPTY_INSIGHTS);

  /* ── Playlists: vêm do cache compartilhado (react-query); só busca logado ── */
  const playlistsQuery = usePlaylists({ enabled: isAuthenticated });
  const playlists = playlistsQuery.data ?? NO_PLAYLISTS;
  const invalidatePlaylists = useInvalidatePlaylists();
  const manager = usePlaylistManager({ onChanged: invalidatePlaylists });

  /* ── Cifras: busca, filtros, favoritos e paginação ── */
  const {
    categorias, cifras, pages, loaded, search, setSearch, categoriaFiltro, setCategoriaFiltro, filterLabel,
    artistaFiltro, setArtistaFiltro, favoritosMode, handleToggleFavoritosMode, favoritosIds, favoritosSet,
    handleToggleFavorito, currentPage, setCurrentPage,
  } = useCifrasBusca({ limit: 6, withArtist: true });

  useEffect(() => {
    getCifraHomeInsightsService(10).then((r) => setInsights(r.data || {})).catch(() => {});
  }, []);

  useEffect(() => {
    if (playlistsQuery.isError) toast.error("Falha ao carregar playlists.");
  }, [playlistsQuery.isError]);

  // "Nome (Pai)" para o rótulo da categoria de uma cifra
  const getCatLabel = (cat) => {
    const id = typeof cat === "string" ? cat : cat?._id;
    const c = categorias.find((x) => x._id === id);
    if (!c) return "";
    const parentId = typeof c.parent === "string" ? c.parent : c.parent?._id;
    const parent = categorias.find((x) => x._id === parentId);
    return parent ? `${c.nome} (${parent.nome})` : c.nome;
  };

  const handleFilterByArtist = useCallback(
    (nome) => {
      setArtistaFiltro(nome);
      setSearch("");
      cifraPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [setArtistaFiltro, setSearch],
  );

  return (
    <>
      <S.HomeWrapper>
        <PlaylistsPanel
          isAuthenticated={isAuthenticated}
          user={user}
          isAdmin={isAdmin}
          playlists={playlists}
          loading={playlistsQuery.isLoading}
          manager={manager}
        />

        {/* ══ PAINEL DIREITO: CIFRAS ══ */}
        <S.Panel ref={cifraPanelRef}>
          <S.FiltersContainer>
            <S.FilterInput
              type="text"
              placeholder="Pesquisar música ( / )"
              data-global-search
              value={search}
              aria-label="Pesquisar música"
              onChange={(e) => setSearch(e.target.value)}
            />

            <CategoriaFilterDropdown
              categorias={categorias}
              value={categoriaFiltro}
              onChange={setCategoriaFiltro}
              label={filterLabel}
              styles={FILTER_STYLES}
              togglePadding="0 10px"
            />

            <S.FavBtn type="button" $active={favoritosMode} onClick={handleToggleFavoritosMode}>
              {favoritosMode ? "♥" : "♡"} Favoritos
            </S.FavBtn>

            {artistaFiltro && (
              <S.ActiveFilterChip type="button" onClick={() => setArtistaFiltro("")}>
                Artista: {artistaFiltro} ×
              </S.ActiveFilterChip>
            )}

            {(search || categoriaFiltro || artistaFiltro) && (
              <button
                type="button"
                className="btn"
                onClick={() => { setSearch(""); setCategoriaFiltro(""); setArtistaFiltro(""); }}
              >
                Limpar
              </button>
            )}
          </S.FiltersContainer>

          {!loaded ? (
            <SkeletonRows count={6} />
          ) : favoritosMode && favoritosIds.length === 0 ? (
            <EmptyState
              compact
              icon="favorito"
              title="Você ainda não tem favoritos"
              text="Toque no coração de uma música para salvá-la aqui."
            />
          ) : cifras.length === 0 ? (
            <EmptyState
              compact
              icon="busca"
              title="Nenhuma cifra encontrada"
              text="Tente outro nome, categoria ou artista."
            />
          ) : (
            <>
              <S.CifraList>
                {cifras.map((cifra) => (
                  <CifraListItem
                    key={cifra._id}
                    cifra={cifra}
                    isFav={favoritosSet.has(cifra._id)}
                    onToggleFav={handleToggleFavorito}
                    getCatLabel={getCatLabel}
                  />
                ))}
              </S.CifraList>

              <Paginacao page={currentPage} pages={pages} onChange={setCurrentPage} styles={PAGINATION_STYLES} />
            </>
          )}
        </S.Panel>
      </S.HomeWrapper>

      <InsightsSection insights={insights} onFilterByArtist={handleFilterByArtist} />

      {/* modais de criar/editar/compartilhar/excluir playlist */}
      {manager.modals}
    </>
  );
}
