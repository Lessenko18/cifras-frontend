import { usePlaylistManager } from "../../components/PlaylistManager/PlaylistManager";
import NextEventCard from "../../components/NextEventCard/NextEventCard";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useInitialUrlFilters, useResetPageOnChange, useSyncUrlFilters } from "../../hooks/useUrlFilters";
import { getCifrasService, getCifraHomeInsightsService } from "../../service/cifraService";
import { getCategoriasService } from "../../service/categoriaService";
import { getFavoritosService, toggleFavoritoService } from "../../service/favoritosService";
import { useSearch } from "../../hooks/useSearch";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { useCategoriaFilter } from "../../hooks/useCategoriaFilter";
import EmptyState from "../../components/EmptyState/EmptyState";
import { SkeletonCards, SkeletonRows } from "../../components/Skeleton/Skeleton";
import { useClickOutside } from "../../hooks/useClickOutside";
import { usePlaylists, useInvalidatePlaylists } from "../../hooks/queries/usePlaylists";
import { useAuth } from "../../context/AuthContext";
import { getPlaylistPermissions } from "../../utils/playlistAccess";
import toast from "react-hot-toast";
import { FiMusic, FiTrendingUp, FiUsers, FiStar } from "react-icons/fi";
import {
  HomeWrapper,
  Panel,
  PanelHeader,
  PanelTitle,
  CreatePlaylistBtn,
  PlaylistCardsGrid,
  PlaylistEmpty,
  FiltersContainer,
  FilterInput,
  FilterDropdownWrapper,
  FilterDropdownTrigger,
  FilterDropdownPanel,
  FilterDropdownItem,
  FavBtn,
  CifraList,
  PaginationContainer,
  PaginationButton,
  PaginationInfo,
  InsightsWrapper,
  InsightsGrid,
  InsightPanel,
  InsightPanelHeader,
  InsightIconBadge,
  InsightPanelTitleGroup,
  InsightPanelTitle,
  InsightPanelSubtitle,
  SeeAllButton,
  RankedList,
  RankedRow,
  RankIndex,
  RankIconSquare,
  RankInfo,
  RankName,
  RankSub,
  RankStat,
  InsightEmpty,
  ActiveFilterChip,
} from "./HomeStyled";
import { PlaylistCardItem, ArtistAvatar, CifraListItem } from "./HomeParts";
import { sortByNome, AVATAR_PALETTE, formatCount, formatRelativeDate } from "./homeHelpers";
const NO_PLAYLISTS = [];

export default function Home() {
  const navigate = useNavigate();
  const { user: authenticatedUser, isAdmin, isAuthenticated } = useAuth();
  const requireAuth = useRequireAuth();

  /* ── Estado: cifras ─────────────────────────────── */
  const [cifras, setCifras] = useState([]);
  const [cifrasLoaded, setCifrasLoaded] = useState(false);
  const [pages, setPages] = useState(0);
  const urlFilters = useInitialUrlFilters();
  const [currentPage, setCurrentPage] = useState(() => urlFilters.getNumber("page"));
  const [categorias, setCategorias] = useState([]);
  const { search: searchNome, setSearch: setSearchNome, debounced } = useSearch(300, urlFilters.get("q"));
  const [categoriaFiltro, setCategoriaFiltro] = useState(() => urlFilters.get("cat"));
  const [artistaFiltro, setArtistaFiltro] = useState(() => urlFilters.get("artista"));
  const [insights, setInsights] = useState({ maisAcessadasMes: [], maisAcessadas: [], novas: [], artistasMaisAcessados: [] });
  const [expandedPanels, setExpandedPanels] = useState({ musicas: false, artistas: false, novas: false });
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterExpanded, setFilterExpanded] = useState(new Set());
  const filterRef = useRef(null);
  const cifraPanelRef = useRef(null);
  const [favoritosIds, setFavoritosIds] = useState([]);
  const [favoritosMode, setFavoritosMode] = useState(() => urlFilters.get("fav") === "1");
  const favoritosSet = useMemo(() => new Set(favoritosIds), [favoritosIds]);

  /* ── Estado: playlists ──────────────────────────── */
  // Playlists vêm do cache compartilhado (react-query); só busca logado
  const playlistsQuery = usePlaylists({ enabled: isAuthenticated });
  const playlists = playlistsQuery.data ?? NO_PLAYLISTS;
  const playlistsLoading = playlistsQuery.isLoading;
  const invalidatePlaylists = useInvalidatePlaylists();
  const [playlistPage, setPlaylistPage] = useState(0);
  const PLAYLISTS_PER_PAGE = 6;

  /* ── Computed: playlists paginadas (mais recentes primeiro) ─────────────── */
  const sortedPlaylists = useMemo(
    () =>
      [...playlists].sort((a, b) => {
        if (a?.createdAt && b?.createdAt) {
          const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          if (diff !== 0) return diff;
        }
        // ObjectId do MongoDB é cronologicamente ordenável — usado como fallback/critério principal
        return String(b?._id || "").localeCompare(String(a?._id || ""));
      }),
    [playlists]
  );
  const totalPlaylistPages = Math.ceil(sortedPlaylists.length / PLAYLISTS_PER_PAGE);
  const visiblePlaylists = useMemo(
    () => sortedPlaylists.slice(0, (playlistPage + 1) * PLAYLISTS_PER_PAGE),
    [sortedPlaylists, playlistPage]
  );

  /* ── Computed: categorias ───────────────────────── */
  const rootCategorias = useMemo(
    () => categorias.filter((c) => !c.parent).sort(sortByNome),
    [categorias]
  );
  const { relevantCategoriaIds, filterLabel } = useCategoriaFilter(categorias, categoriaFiltro);

  /* ── Efeitos iniciais ───────────────────────────── */
  useEffect(() => {
    getCategoriasService().then((r) => setCategorias(r.data || [])).catch(() => {});
    getCifraHomeInsightsService(10).then((r) => setInsights(r.data || {})).catch(() => {});
    if (!isAuthenticated) { setFavoritosIds([]); return; }
    getFavoritosService().then(setFavoritosIds).catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    if (playlistsQuery.isError) toast.error("Falha ao carregar playlists.");
  }, [playlistsQuery.isError]);

  useClickOutside(filterRef, () => setFilterOpen(false));

  /* ── Fetch cifras ───────────────────────────────── */
  const fetchCifrasCtrl = useRef(null);
  const fetchCifras = useCallback(async () => {
    // cancela a busca anterior: só a resposta da última digitação vale
    fetchCifrasCtrl.current?.abort();
    const ctrl = new AbortController();
    fetchCifrasCtrl.current = ctrl;
    if (favoritosMode && favoritosIds.length === 0) {
      setCifras([]); setPages(0); setCifrasLoaded(true); return;
    }
    try {
      const res = await getCifrasService({
        nome: debounced || undefined,
        artista: artistaFiltro || undefined,
        categorias: relevantCategoriaIds.length ? relevantCategoriaIds : undefined,
        favoritos: favoritosMode ? favoritosIds : undefined,
        page: currentPage,
        limit: 6,
        signal: ctrl.signal,
      });
      setCifras(res.data.cifras || []);
      setPages(res.data.pages || 0);
    } catch {
      // busca cancelada ou falha de rede: mantém a lista atual
    } finally {
      if (!ctrl.signal.aborted) setCifrasLoaded(true);
    }
  }, [debounced, artistaFiltro, relevantCategoriaIds, currentPage, favoritosMode, favoritosIds]);

  useEffect(() => { fetchCifras(); }, [fetchCifras]);
  useResetPageOnChange([debounced, artistaFiltro, categoriaFiltro, favoritosMode], () => setCurrentPage(0));
  useSyncUrlFilters({ q: searchNome, cat: categoriaFiltro, artista: artistaFiltro, fav: favoritosMode ? "1" : "", page: currentPage });

  /* ── Favoritos ──────────────────────────────────── */
  const handleToggleFavorito = useCallback(async (cifraId) => {
    if (!requireAuth("Você precisa fazer login para favoritar músicas.")) return;
    try {
      const updated = await toggleFavoritoService(cifraId);
      setFavoritosIds(updated);
    } catch {
      // falha ao favoritar: o coração só não muda
    }
  }, [requireAuth]);

  const manager = usePlaylistManager({ onChanged: invalidatePlaylists });

  /* ── Categorias helper ──────────────────────────── */
  const findCategoria = (cat) => {
    const id = typeof cat === "string" ? cat : cat?._id;
    return categorias.find((c) => c._id === id);
  };
  const getCatLabel = (cat) => {
    const c = findCategoria(cat);
    if (!c) return "";
    const parentId = typeof c.parent === "string" ? c.parent : c.parent?._id;
    const parent = categorias.find((x) => x._id === parentId);
    return parent ? `${c.nome} (${parent.nome})` : c.nome;
  };

  const handleFilterByArtist = useCallback((nome) => {
    setArtistaFiltro(nome);
    setSearchNome("");
    cifraPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [setSearchNome]);

  /* ── Render ─────────────────────────────────────── */
  return (
    <>
    <HomeWrapper>
      {/* ══ PAINEL ESQUERDO: PLAYLISTS ══ */}
      <Panel>
        {!isAuthenticated ? (
          <>
            <PanelHeader>
              <PanelTitle>Minhas Playlists</PanelTitle>
            </PanelHeader>
            <PlaylistEmpty>
              <p>Você precisa fazer login para ver, criar e gerenciar suas playlists.</p>
              <CreatePlaylistBtn as={Link} to="/login" state={{ from: "/home" }}>
                Fazer login
              </CreatePlaylistBtn>
            </PlaylistEmpty>
          </>
        ) : (
          <>
            <PanelHeader>
              <PanelTitle>Minhas Playlists</PanelTitle>
              <CreatePlaylistBtn type="button" onClick={manager.openCreate}>
                + Criar Nova Playlist
              </CreatePlaylistBtn>
            </PanelHeader>

            {!playlistsLoading && <NextEventCard playlists={playlists} />}

            {playlistsLoading ? (
              <SkeletonCards count={4} columns={2} height={150} />
            ) : playlists.length === 0 ? (
              <EmptyState
                icon="playlist"
                title="Você ainda não tem playlists"
                text="Monte seu repertório juntando as músicas que você mais toca."
                action={
                  <CreatePlaylistBtn type="button" onClick={manager.openCreate}>
                    Criar primeira playlist
                  </CreatePlaylistBtn>
                }
              />
            ) : (
              <PlaylistCardsGrid>
                {visiblePlaylists.map((pl) => {
                  const { canShare, canEdit, canDelete } = getPlaylistPermissions(pl, authenticatedUser, isAdmin);
                  return (
                    <PlaylistCardItem
                      key={pl._id}
                      pl={pl}
                      canShare={canShare}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      onView={(id) => navigate(`/home/playlists/${id}/ver`)}
                      onShare={manager.openShare}
                      onEdit={manager.openEdit}
                      onDelete={manager.openDelete}
                    />
                  );
                })}
              </PlaylistCardsGrid>
            )}

            {playlistPage + 1 < totalPlaylistPages && (
              <PaginationContainer>
                <PaginationButton onClick={() => setPlaylistPage((p) => p + 1)}>
                  Ver mais ({sortedPlaylists.length - visiblePlaylists.length} restantes)
                </PaginationButton>
              </PaginationContainer>
            )}
          </>
        )}
      </Panel>

      {/* ══ PAINEL DIREITO: CIFRAS ══ */}
      <Panel ref={cifraPanelRef}>
        <FiltersContainer>
          <FilterInput
            type="text"
            placeholder="Pesquisar música ( / )"
            data-global-search
            value={searchNome}
            aria-label="Pesquisar música"
            onChange={(e) => setSearchNome(e.target.value)}
          />

          <FilterDropdownWrapper ref={filterRef}>
            <FilterDropdownTrigger
              type="button"
              onClick={() => setFilterOpen((o) => !o)}
              aria-label="Filtrar por categoria"
            >
              <span>{filterLabel}</span>
              <span style={{ fontSize: "0.7em", color: "#7c3aed",
                transform: filterOpen ? "rotate(0deg)" : "rotate(-90deg)",
                display: "inline-block", transition: "transform 0.2s" }}>▼</span>
            </FilterDropdownTrigger>

            {filterOpen && (
              <FilterDropdownPanel>
                <FilterDropdownItem $active={categoriaFiltro === ""}
                  onClick={() => { setCategoriaFiltro(""); setFilterOpen(false); }}>
                  Todas as categorias
                </FilterDropdownItem>
                {rootCategorias.map((root) => {
                  const children = categorias
                    .filter((c) => String(c.parent?._id || c.parent) === String(root._id))
                    .sort(sortByNome);
                  const isExpanded = filterExpanded.has(root._id);
                  if (children.length > 0) {
                    return (
                      <div key={root._id}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <FilterDropdownItem $active={categoriaFiltro === root._id}
                            style={{ flex: 1 }}
                            onClick={() => { setCategoriaFiltro(root._id); setFilterOpen(false); }}>
                            {root.nome}
                          </FilterDropdownItem>
                          <button type="button"
                            onClick={() => setFilterExpanded((prev) => {
                              const next = new Set(prev);
                              next.has(root._id) ? next.delete(root._id) : next.add(root._id);
                              return next;
                            })}
                            style={{ background: "none", border: "none", cursor: "pointer",
                              padding: "0 10px", fontSize: "0.7em", color: "#7c3aed",
                              transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}>
                            ▼
                          </button>
                        </div>
                        {isExpanded && children.map((child) => (
                          <FilterDropdownItem key={child._id} $active={categoriaFiltro === child._id} $indent
                            onClick={() => { setCategoriaFiltro(child._id); setFilterOpen(false); }}>
                            ↳ {child.nome}
                          </FilterDropdownItem>
                        ))}
                      </div>
                    );
                  }
                  return (
                    <FilterDropdownItem key={root._id} $active={categoriaFiltro === root._id}
                      onClick={() => { setCategoriaFiltro(root._id); setFilterOpen(false); }}>
                      {root.nome}
                    </FilterDropdownItem>
                  );
                })}
              </FilterDropdownPanel>
            )}
          </FilterDropdownWrapper>

          <FavBtn type="button" $active={favoritosMode}
            onClick={() => setFavoritosMode((m) => !m)}>
            {favoritosMode ? "♥" : "♡"} Favoritos
          </FavBtn>

          {artistaFiltro && (
            <ActiveFilterChip type="button" onClick={() => setArtistaFiltro("")}>
              Artista: {artistaFiltro} ×
            </ActiveFilterChip>
          )}

          {(searchNome || categoriaFiltro || artistaFiltro) && (
            <button type="button" className="btn"
              onClick={() => { setSearchNome(""); setCategoriaFiltro(""); setArtistaFiltro(""); }}>
              Limpar
            </button>
          )}
        </FiltersContainer>

        {!cifrasLoaded ? (
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
            <CifraList>
              {cifras.map((cifra) => (
                <CifraListItem
                  key={cifra._id}
                  cifra={cifra}
                  isFav={favoritosSet.has(cifra._id)}
                  onToggleFav={handleToggleFavorito}
                  getCatLabel={getCatLabel}
                />
              ))}
            </CifraList>

            {pages > 1 && (
              <PaginationContainer>
                <PaginationButton disabled={currentPage === 0}
                  onClick={() => setCurrentPage((p) => p - 1)}>
                  Anterior
                </PaginationButton>
                <PaginationInfo>Página {currentPage + 1} de {pages}</PaginationInfo>
                <PaginationButton disabled={currentPage + 1 >= pages}
                  onClick={() => setCurrentPage((p) => p + 1)}>
                  Próxima
                </PaginationButton>
              </PaginationContainer>
            )}
          </>
        )}
      </Panel>
    </HomeWrapper>

    {/* ══ INSIGHTS: músicas / artistas / novas ══ */}
    <InsightsWrapper>
      <InsightsGrid>
        {/* Músicas mais acessadas — lista ranqueada */}
        <InsightPanel $bgImage="/fundoGuitarra.webp">
          <InsightPanelHeader>
            <InsightPanelTitleGroup>
              <InsightIconBadge $gradient="linear-gradient(135deg, #8b5cf6, #6d28d9)"><FiTrendingUp size={20} aria-hidden="true" /></InsightIconBadge>
              <div>
                <InsightPanelTitle>Músicas mais acessadas</InsightPanelTitle>
                <InsightPanelSubtitle>As cifras que estão em alta por aqui</InsightPanelSubtitle>
              </div>
            </InsightPanelTitleGroup>
            {insights.maisAcessadas?.length > 5 && (
              <SeeAllButton type="button"
                onClick={() => setExpandedPanels((p) => ({ ...p, musicas: !p.musicas }))}>
                {expandedPanels.musicas ? "Ver menos" : "Ver tudo →"}
              </SeeAllButton>
            )}
          </InsightPanelHeader>
          {insights.maisAcessadas?.length ? (
            <RankedList>
              {insights.maisAcessadas.slice(0, expandedPanels.musicas ? 10 : 5).map((cifra, i) => (
                <RankedRow key={cifra._id} type="button" onClick={() => navigate(`/home/cifra/${cifra._id}`)}>
                  <RankIndex>{i + 1}</RankIndex>
                  <RankIconSquare $variant="purple"><FiMusic size={15} /></RankIconSquare>
                  <RankInfo>
                    <RankName>{cifra.nome}</RankName>
                    {cifra.artista && <RankSub>{cifra.artista}</RankSub>}
                  </RankInfo>
                  {formatCount(cifra.acessos) && (
                    <RankStat $variant="fire">🔥 {formatCount(cifra.acessos)}</RankStat>
                  )}
                </RankedRow>
              ))}
            </RankedList>
          ) : (
            <InsightEmpty>Ainda não há dados suficientes de acesso.</InsightEmpty>
          )}
        </InsightPanel>

        {/* Artistas mais acessados — lista ranqueada */}
        <InsightPanel $bgImage="/MaisAcessados.webp">
          <InsightPanelHeader>
            <InsightPanelTitleGroup>
              <InsightIconBadge $gradient="linear-gradient(135deg, #38bdf8, #0369a1)"><FiUsers size={20} aria-hidden="true" /></InsightIconBadge>
              <div>
                <InsightPanelTitle>Artistas mais acessados</InsightPanelTitle>
                <InsightPanelSubtitle>Os artistas que você mais ouve</InsightPanelSubtitle>
              </div>
            </InsightPanelTitleGroup>
            {insights.artistasMaisAcessados?.length > 5 && (
              <SeeAllButton type="button"
                onClick={() => setExpandedPanels((p) => ({ ...p, artistas: !p.artistas }))}>
                {expandedPanels.artistas ? "Ver menos" : "Ver tudo →"}
              </SeeAllButton>
            )}
          </InsightPanelHeader>
          {insights.artistasMaisAcessados?.length ? (
            <RankedList>
              {insights.artistasMaisAcessados.slice(0, expandedPanels.artistas ? 10 : 5).map((item, i) => (
                <RankedRow key={item.artista} type="button" onClick={() => handleFilterByArtist(item.artista)}>
                  <RankIndex>{i + 1}</RankIndex>
                  <ArtistAvatar artista={item.artista} bg={AVATAR_PALETTE[i % AVATAR_PALETTE.length]} />
                  <RankInfo>
                    <RankName>{item.artista}</RankName>
                  </RankInfo>
                  {formatCount(item.acessos) && (
                    <RankStat $variant="plays">▶ {formatCount(item.acessos)}</RankStat>
                  )}
                </RankedRow>
              ))}
            </RankedList>
          ) : (
            <InsightEmpty>Ainda não há dados suficientes de acesso.</InsightEmpty>
          )}
        </InsightPanel>

        {/* Novas músicas — lista ranqueada */}
        <InsightPanel $bgImage="/NovasMusicas.webp">
          <InsightPanelHeader>
            <InsightPanelTitleGroup>
              <InsightIconBadge $gradient="linear-gradient(135deg, #a78bfa, #7c3aed)"><FiStar size={20} aria-hidden="true" /></InsightIconBadge>
              <div>
                <InsightPanelTitle>Novas músicas</InsightPanelTitle>
                <InsightPanelSubtitle>As últimas cifras adicionadas</InsightPanelSubtitle>
              </div>
            </InsightPanelTitleGroup>
            {insights.novas?.length > 5 && (
              <SeeAllButton type="button"
                onClick={() => setExpandedPanels((p) => ({ ...p, novas: !p.novas }))}>
                {expandedPanels.novas ? "Ver menos" : "Ver tudo →"}
              </SeeAllButton>
            )}
          </InsightPanelHeader>
          {insights.novas?.length ? (
            <RankedList>
              {insights.novas.slice(0, expandedPanels.novas ? 10 : 5).map((cifra, i) => (
                <RankedRow key={cifra._id} type="button" onClick={() => navigate(`/home/cifra/${cifra._id}`)}>
                  <RankIndex>{i + 1}</RankIndex>
                  <RankIconSquare $variant="blue"><FiMusic size={15} /></RankIconSquare>
                  <RankInfo>
                    <RankName>{cifra.nome}</RankName>
                    {cifra.artista && <RankSub>{cifra.artista}</RankSub>}
                  </RankInfo>
                  {formatRelativeDate(cifra.createdAt) && (
                    <RankStat $variant="date">🗓 {formatRelativeDate(cifra.createdAt)}</RankStat>
                  )}
                </RankedRow>
              ))}
            </RankedList>
          ) : (
            <EmptyState compact icon="cifra" title="Nenhuma música cadastrada ainda" />
          )}
        </InsightPanel>
      </InsightsGrid>
    </InsightsWrapper>

      {/* modais de criar/editar/compartilhar/excluir playlist */}
      {manager.modals}
    </>
  );
}
